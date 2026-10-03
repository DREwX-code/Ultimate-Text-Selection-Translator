import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechService} from '../src/speech-service.js';
test('legacy autoplay denial stops speech instead of fetching every remaining paragraph', async () => {
    const calls=[],states=[];
    const service=createSpeechService({request: details=>{calls.push(details);return {abort(){}};},browserLanguage:'en',createAudio:()=>({play:()=>Promise.reject(Error('Denied')),pause(){}}),createObjectUrl:()=> 'blob:qa',revokeObjectUrl:()=>{},allowBlobAudioFallback:true,onStateChange:s=>states.push(s)});
    service.speak('Hello '.repeat(100),'en','test');
    calls[0].onload({status:200,response:new ArrayBuffer(4)});
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(calls.length,1);assert.equal(states.at(-1).playing,false);
});
test('TTS splits Unicode safely and timeout clears playing state', () => {
    const calls=[],states=[];
    const service=createSpeechService({request: details=>{calls.push(details);return {abort(){}};},browserLanguage:'en',onStateChange:s=>states.push(s)});
    assert.doesNotThrow(()=>service.speak('a'+'🙂'.repeat(200),'en','test'));
    assert.ok(new URL(calls[0].url).searchParams.get('q').length<=180);
    calls[0].ontimeout();assert.equal(states.at(-1).playing,false);
});
test('Web Audio plays the fetched buffer without assigning a CSP-blocked blob URL', async () => {
    const calls = [];
    let objectUrlCalls = 0;
    let started = false;
    const context = {
        state: 'running',
        destination: {},
        decodeAudioData: () => Promise.resolve({}),
        createBufferSource: () => ({
            connect() {}, disconnect() {}, stop() {},
            start() { started = true; }
        })
    };
    const service = createSpeechService({
        request: details => { calls.push(details); return { abort() {} }; },
        browserLanguage: 'en',
        createAudio: () => { throw Error('The blob URL fallback should not run'); },
        createObjectUrl: () => { objectUrlCalls += 1; return 'blob:blocked-by-csp'; },
        createAudioContext: () => context,
        onStateChange() {}
    });
    service.speak('Hello', 'en', 'test');
    calls[0].onload({ status: 200, response: new ArrayBuffer(4) });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(started, true);
    assert.equal(objectUrlCalls, 0);
});
test('a missing Web Audio decoder stops cleanly without attempting a CSP-blocked blob URL', async () => {
    const calls = [];
    let objectUrlCalls = 0;
    const states = [];
    const service = createSpeechService({
        request: details => { calls.push(details); return { abort() {} }; },
        browserLanguage: 'en',
        createAudioContext: () => null,
        createObjectUrl: () => { objectUrlCalls += 1; return 'blob:blocked-by-csp'; },
        onStateChange: state => states.push(state)
    });
    service.speak('Hello', 'en', 'test');
    calls[0].onload({ status: 200, response: new ArrayBuffer(4) });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(objectUrlCalls, 0);
    assert.equal(states.at(-1).playing, false);
});
