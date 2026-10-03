import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUserscriptApi } from '../src/userscript-api.js';
test('async-only managers hydrate settings before synchronous controller reads', async () => {
    const saved = new Map([['language','ar']]);
    const api = createUserscriptApi({ modern: { async getValue(key) { return saved.get(key); }, async setValue(key,value) { saved.set(key,value); } } });
    await api.initialize(['language','absent']);
    assert.equal(api.getValue('language','en'),'ar');
    assert.equal(api.getValue('absent',true),true);
    await Promise.all([api.setValue('language','fr'),api.setValue('language','ja')]);
    assert.equal(saved.get('language'),'ja');
});
test('legacy APIs remain supported', async () => {
    let written;
    const api = createUserscriptApi({ read: () => false, write: (key,value) => { written=value; } });
    await api.initialize(['bubble']);
    assert.equal(api.getValue('bubble',true), false);
    await api.setValue('bubble',true); assert.equal(written,true);
});
test('menu commands work with legacy and modern userscript APIs', () => {
    const legacyCalls = [];
    const legacy = createUserscriptApi({
        registerMenu: (...args) => { legacyCalls.push(args); return 'legacy-command'; }
    });
    const callback = () => {};
    assert.equal(legacy.registerMenuCommand('Open', callback), 'legacy-command');
    assert.deepEqual(legacyCalls[0].slice(0, 2), ['Open', callback]);

    const modernCalls = [];
    const modern = createUserscriptApi({
        modern: { registerMenuCommand: (...args) => { modernCalls.push(args); return 'modern-command'; } }
    });
    assert.equal(modern.registerMenuCommand('Disable', callback, { autoClose: true }), 'modern-command');
    assert.deepEqual(modernCalls[0], ['Disable', callback, { autoClose: true }]);
});
test('promise plus callback request delivers only one result', async () => {
    let count = 0;
    const response = { status:200, responseText:'[]' };
    const api = createUserscriptApi({ modern: { xmlHttpRequest(options) { options.onload(response); return Promise.resolve(response); } } });
    api.xmlHttpRequest({ onload() { count++; } });
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(count,1);
});
test('abort suppresses late results even if the manager cannot abort transport', async () => {
    let resolve, success = false, aborted = false;
    const api = createUserscriptApi({ modern: { xmlHttpRequest() { return new Promise(done => { resolve=done; }); } } });
    api.xmlHttpRequest({ onload() { success=true; }, onabort() { aborted=true; } }).abort();
    resolve({ status:200 }); await new Promise(done=>setTimeout(done,0));
    assert.equal(aborted,true); assert.equal(success,false);
});
