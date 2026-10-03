import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTranslationChunks } from '../src/text-segmentation.js';
import { createTranslationService, TRANSLATION_LIMITS, parseTranslationResponse } from '../src/translation-service.js';
import { clampPosition, getViewport } from '../src/viewport.js';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const response = (text, detected = 'en') => ({ status: 200, responseText: JSON.stringify([[[text]], null, detected]) });
function setup(options = {}) {
    const calls = [], detected = [];
    const service = createTranslationService({ request(details) { const call = { details, aborted: false }; calls.push(call); return { abort() { call.aborted = true; details.onabort(); } }; },
        getErrorMessages: () => ({ noText: 'Empty', connection: 'Unavailable', translation: 'Invalid' }),
        isSupportedDetectedLanguage: lang => ['en', 'fr', 'ar', 'ja'].includes(lang), onDetectedLanguage: lang => detected.push(lang), ...options });
    return { ...service, calls, detected };
}
function translate(service, text, source = 'auto', target = 'fr') {
    let cancel;
    const promise = new Promise(resolve => { cancel = service.translateText(text, source, target, (text, target, error) => resolve({ text, target, error })); });
    return { promise, cancel };
}
test('chunks preserve paragraphs, CRLF, punctuation, Unicode and every code point', () => {
    for (const text of ['a\r\nb\n\nمرحبا\r日本語', '🙂'.repeat(1300), 'a'.repeat(1199) + '🙂' + 'b'.repeat(3000)]) {
        const chunks = buildTranslationChunks(text);
        assert.equal(chunks.join(''), text);
        assert.ok(chunks.every(chunk => chunk.length <= 1200));
        for (const chunk of chunks) assert.doesNotThrow(() => encodeURIComponent(chunk));
    }
    assert.throws(() => buildTranslationChunks('abc', 0), RangeError);
});
test('rejects HTTP and malformed or empty responses; supports fallback format', () => {
    for (const data of [{ status: 429 }, { status: 200, responseText: '{}' }, response('')]) assert.throws(() => parseTranslationResponse(data, 'auto'));
    assert.deepEqual(parseTranslationResponse({ status: 200, responseText: '{"sentences":[{"trans":"Bonjour"}],"src":"en"}' }, 'auto'), { text: 'Bonjour', detected: 'en' });
});
test('deduplicates concurrent work and caches successes without losing whitespace', async () => {
    const service = setup();
    const first = translate(service, ' Hello '), second = translate(service, 'Hello');
    assert.equal(service.calls.length, 1);
    service.calls[0].details.onload(response('Bonjour'));
    assert.equal((await first.promise).text, ' Bonjour ');
    assert.equal((await second.promise).text, 'Bonjour');
    assert.equal((await translate(service, 'Hello').promise).text, 'Bonjour');
    assert.equal(service.calls.length, 1);
});
test('cancelling one subscriber keeps the shared request; last subscriber aborts', async () => {
    const service = setup();
    const first = translate(service, 'Hello'), second = translate(service, 'Hello');
    first.cancel(); assert.equal(service.calls[0].aborted, false);
    second.cancel(); assert.equal(service.calls[0].aborted, true);
    await tick(); assert.deepEqual(service.detected, []);
});
test('fallback succeeds, but rate limits do not generate extra attempts', async () => {
    const service = setup(); const result = translate(service, 'Hello');
    service.calls[0].details.onerror(); await tick();
    assert.equal(service.calls.length, 2);
    assert.match(service.calls[1].details.url, /dj=1/);
    service.calls[1].details.onload(response('Bonjour'));
    assert.equal((await result.promise).text, 'Bonjour');
    const next = translate(service, 'Other'); service.calls[2].details.onload({ status: 429 });
    assert.equal((await next.promise).error.message, 'Unavailable');
    assert.equal(service.calls.length, 3);
});
test('hard timeout bounds a silent manager and errors are never cached as translations', async () => {
    const service = setup({ limits: { ...TRANSLATION_LIMITS, timeout: 5 } });
    const result = await translate(service, 'Hello').promise;
    assert.equal(result.text, ''); assert.ok(result.error);
    assert.equal(service.calls.length, 2);
    assert.ok(service.calls.every(call => call.aborted));
});
test('long text respects global concurrency, output order and paragraph spacing', async () => {
    const service = setup();
    const result = translate(service, Array.from({ length: 8 }, (_, i) => `Line ${i}`).join('\n\n'));
    assert.equal(service.calls.length, 3);
    for (let i = 0; i < 8; i++) {
        await tick(); service.calls[i].details.onload(response(`Ligne ${i}`));
    }
    assert.equal((await result.promise).text, Array.from({ length: 8 }, (_, i) => `Ligne ${i}`).join('\n\n'));
});
test('empty, oversized and same-language inputs avoid the network', async () => {
    const service = setup();
    assert.ok((await translate(service, '').promise).error);
    assert.ok((await translate(service, 'x'.repeat(50001)).promise).error);
    assert.equal((await translate(service, 'Déjà français', 'fr').promise).text, 'Déjà français');
    assert.equal(service.calls.length, 0);
});
test('viewport clamp includes document scroll and keyboard offsets, even for oversized panels', () => {
    assert.deepEqual(clampPosition(-10, 2000, 300, 200, { left: 20, top: 1000, width: 320, height: 240 }), { left: 30, top: 1030 });
    assert.deepEqual(clampPosition(0, 0, 420, 300, { left: 0, top: 0, width: 200, height: 100 }), { left: 10, top: 10 });
});

test('cancelled runs never publish late detection or results', async () => {
    const service = setup(); let published = false;
    const cancel = service.translateText('Old selection', 'auto', 'fr', () => { published = true; });
    cancel();
    service.calls[0].details.onload(response('Ancien texte'));
    await tick();
    assert.equal(published, false); assert.deepEqual(service.detected, []);
});
test('a failed chunk cancels sibling requests and returns no partial translation', async () => {
    const service = setup(); const result = translate(service, 'First\nSecond\nThird');
    service.calls[0].details.onload({ status: 403 });
    assert.equal((await result.promise).text, '');
    assert.ok(service.calls[1].aborted && service.calls[2].aborted);
});
test('a 24000-character Unicode document survives ordered bounded translation', async () => {
    const service = setup();
    const input = ('A sentence with emoji 🙂 and accents é. '.repeat(600)) + '\r\n\r\nآخر فقرة';
    const expected = new Set(buildTranslationChunks(input).map(chunk => chunk.trim()).filter(Boolean)).size;
    const result = translate(service, input);
    let completed = 0;
    while (completed < expected) {
        await tick();
        const batch = service.calls.filter(call => !call.replied);
        assert.ok(batch.length <= 3);
        for (const call of batch.reverse()) {
            call.replied = true; completed++;
            call.details.onload(response(new URL(call.details.url).searchParams.get('q')));
        }
    }
    assert.equal((await result.promise).text, input);
});
test('bounded cache evicts older text', async () => {
    const service = setup({ limits: { ...TRANSLATION_LIMITS, cacheEntries: 1 } });
    for (const text of ['One','Two','One']) {
        const result = translate(service, text);
        service.calls.at(-1).details.onload(response(text));
        await result.promise;
    }
    assert.equal(service.calls.length, 3);
});

test('mobile viewport cannot grow from overflowing layout during orientation change', () => {
    const view = getViewport({ scrollX: 0, scrollY: 0, innerWidth: 377, innerHeight: 670,
        visualViewport: { width: 377, height: 669, offsetLeft: 0, offsetTop: 0 },
        document: { documentElement: { clientWidth: 320, clientHeight: 568 } } });
    assert.equal(view.width, 320); assert.equal(view.height, 568);
    const keyboard = getViewport({ scrollX: 0, scrollY: 100, innerWidth: 390, innerHeight: 844,
        visualViewport: { width: 390, height: 260, offsetLeft: 0, offsetTop: 50 },
        document: { documentElement: { clientWidth: 390, clientHeight: 844 } } });
    assert.equal(keyboard.height, 260); assert.equal(keyboard.top, 150);
});

test('zoomed visual viewports retain layout dimensions for panels that may overflow', () => {
    const view = getViewport({
        scrollX: 120,
        scrollY: 80,
        innerWidth: 1280,
        innerHeight: 800,
        visualViewport: { scale: 1.5, width: 853, height: 533, offsetLeft: 60, offsetTop: 40 },
        document: { documentElement: { clientWidth: 853, clientHeight: 533 } }
    });
    assert.deepEqual(view, { left: 120, top: 80, width: 1280, height: 800 });
});
