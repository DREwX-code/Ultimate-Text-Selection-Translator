import { normalizeBrowserLanguage } from './utils.js';
import { userscriptApi } from './userscript-api.js';
import { buildTranslationChunks } from './text-segmentation.js';

export const TRANSLATION_LIMITS = Object.freeze({ maxText: 50000, concurrency: 3, timeout: 12000, cacheEntries: 80, cacheTTL: 300000 });
const abortError = () => Object.assign(new Error('Cancelled'), { name: 'AbortError' });

export function parseTranslationResponse(response, source) {
    if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
    const data = JSON.parse(response.responseText);
    const parts = Array.isArray(data) ? data[0] : data.sentences?.map(part => [part.trans]);
    if (!Array.isArray(parts) || !parts.length || parts.some(part => !Array.isArray(part) || typeof part[0] !== 'string')) {
        throw new Error('Invalid translation response');
    }
    const text = parts.map(part => part[0]).join('');
    if (!text.trim()) throw new Error('Empty translation');
    const detected = source === 'auto' ? (Array.isArray(data) ? data[2] : data.src) : source;
    return { text, detected: typeof detected === 'string' && detected ? normalizeBrowserLanguage(detected) : null };
}

export function createTranslationService({ request = userscriptApi.xmlHttpRequest, getErrorMessages, isSupportedDetectedLanguage, onDetectedLanguage, limits = TRANSLATION_LIMITS }) {
    const cache = new Map();
    const pending = new Map();
    let active = 0;
    const queue = [];
    function pump() {
        while (active < limits.concurrency && queue.length) {
            const task = queue.shift();
            if (task.signal.aborted) { task.reject(abortError()); continue; }
            active++;
            task.run().then(task.resolve, task.reject).finally(() => { active--; pump(); });
        }
    }
    function attempt(text, source, target, signal, fallback) {
        return new Promise((resolve, reject) => {
            let handle, done = false;
            const finish = (error, value) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                signal.removeEventListener('abort', cancel);
                error ? reject(error) : resolve(value);
            };
            const cancel = () => { finish(abortError()); handle?.abort?.(); };
            const timer = setTimeout(() => { finish(new Error('Timeout')); handle?.abort?.(); }, limits.timeout);
            signal.addEventListener('abort', cancel, { once: true });
            if (signal.aborted) { cancel(); return; }
            const params = new URLSearchParams({ client: 'gtx', sl: source, tl: target, dt: 't', q: text });
            if (fallback) params.set('dj', '1');
            try {
                handle = request({ method: 'GET', anonymous: true, timeout: limits.timeout,
                    url: `https://translate.googleapis.com/translate_a/single?${params}`,
                    onload(response) { try { finish(null, parseTranslationResponse(response, source)); } catch (error) { finish(error); } },
                    onerror: () => finish(new Error('Network error')),
                    ontimeout: () => finish(new Error('Timeout')), onabort: () => finish(abortError()) });
            } catch (error) { finish(error); }
        });
    }
    function chunk(text, source, target, signal) {
        if (!text.trim() || source === target) return Promise.resolve({ text, detected: source === 'auto' ? null : source });
        const leading = text.match(/^\s*/u)[0], trailing = text.match(/\s*$/u)[0];
        const body = text.slice(leading.length, text.length - trailing.length);
        const key = JSON.stringify([source, target, body]);
        const cached = cache.get(key);
        let entry = pending.get(key);
        if (cached && Date.now() - cached.time < limits.cacheTTL) {
            cache.delete(key); cache.set(key, cached);
            return Promise.resolve({ ...cached.value, text: leading + cached.value.text + trailing });
        }
        if (!entry) {
            const controller = new AbortController();
            entry = { controller, users: 0 };
            entry.promise = new Promise((resolve, reject) => {
                queue.push({ signal: controller.signal, resolve, reject, run: async () => {
                    try { return await attempt(body, source, target, controller.signal, false); }
                    catch (error) {
                        if (controller.signal.aborted || error.message === 'HTTP 429' || error.message === 'HTTP 403') throw error;
                        return attempt(body, source, target, controller.signal, true);
                    }
                } });
                pump();
            }).then(value => {
                cache.set(key, { value, time: Date.now() });
                while (cache.size > limits.cacheEntries) cache.delete(cache.keys().next().value);
                return value;
            }).finally(() => { if (pending.get(key) === entry) pending.delete(key); });
            pending.set(key, entry);
        }
        entry.users++;
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (error, value) => {
                if (settled) return;
                settled = true;
                signal.removeEventListener('abort', cancel);
                entry.users--;
                if (!entry.users && error?.name === 'AbortError') {
                    pending.delete(key); entry.controller.abort(); pump();
                }
                error ? reject(error) : resolve({ ...value, text: leading + value.text + trailing });
            };
            const cancel = () => finish(abortError());
            signal.addEventListener('abort', cancel, { once: true });
            entry.promise.then(value => finish(null, value), error => finish(error));
            if (signal.aborted) cancel();
        });
    }
    function translateText(text, source = 'auto', target, callback) {
        const controller = new AbortController();
        source ||= 'auto';
        (async () => {
            try {
                if (!text?.trim()) throw new Error(getErrorMessages().noText);
                if (text.length > limits.maxText) throw new Error(`Maximum: ${limits.maxText.toLocaleString()} characters.`);
                if (!/^[a-z]{2,3}(?:-[a-zA-Z]{2,4})?$/.test(target || '')) throw new Error(getErrorMessages().translation);
                const results = await Promise.all(buildTranslationChunks(text).map(part => chunk(part, source, target, controller.signal)));
                if (controller.signal.aborted) return;
                const detected = results.find(result => result.detected && isSupportedDetectedLanguage(result.detected))?.detected || null;
                onDetectedLanguage(detected);
                callback(results.map(result => result.text).join(''), target, null, detected);
            } catch (error) {
                if (controller.signal.aborted) return;
                controller.abort();
                const message = error.message.startsWith('Maximum:') || error.message === getErrorMessages().noText ? error.message : getErrorMessages().connection;
                callback('', target, { message, cause: error.message });
            }
        })();
        return () => controller.abort();
    }
    return { translateText };
}
