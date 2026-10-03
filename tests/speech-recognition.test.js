import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpeechRecognitionService } from '../src/speech-recognition-service.js';

class FakeRecognition {
    static instances = [];

    constructor() {
        FakeRecognition.instances.push(this);
    }

    start() {
        this.started = true;
    }

    abort() {
        this.aborted = true;
    }
}

function result(transcript, isFinal) {
    return { 0: { transcript }, isFinal };
}

test('streams interim dictation, restarts continuously, and stops on a second toggle', () => {
    FakeRecognition.instances = [];
    const stateChanges = [];
    const transcripts = [];
    const timers = [];
    const service = createSpeechRecognitionService({
        windowRef: { SpeechRecognition: FakeRecognition, navigator: { language: 'fr-FR' } },
        onStateChange: state => stateChanges.push(state),
        setTimer: callback => {
            timers.push(callback);
            return callback;
        },
        clearTimer: () => {}
    });

    assert.equal(service.toggle({
        targetId: 'source',
        language: 'fr',
        onTranscript: text => transcripts.push(text)
    }), true);
    const first = FakeRecognition.instances[0];
    assert.equal(first.lang, 'fr');
    assert.equal(first.continuous, true);
    assert.equal(first.interimResults, true);
    assert.deepEqual(stateChanges, [{ listening: true, targetId: 'source' }]);

    first.onresult({ results: [result('Bon', false)] });
    first.onresult({ results: [result('Bonjour', true)] });
    assert.deepEqual(transcripts, ['Bon', 'Bonjour']);

    first.onend();
    timers.shift()();
    assert.equal(FakeRecognition.instances.length, 2);

    assert.equal(service.toggle({ targetId: 'source' }), true);
    assert.equal(FakeRecognition.instances[1].aborted, true);
    assert.deepEqual(stateChanges.at(-1), { listening: false, targetId: 'source' });
});

test('reports unsupported dictation without creating a recognition instance', () => {
    let error = '';
    const service = createSpeechRecognitionService({ windowRef: {} });
    assert.equal(service.start({
        targetId: 'source',
        onTranscript: () => {},
        onError: value => { error = value; }
    }), false);
    assert.equal(error, 'unsupported');
});

test('falls back to the browser language once when a selected recognition language is unavailable', () => {
    FakeRecognition.instances = [];
    const timers = [];
    const service = createSpeechRecognitionService({
        windowRef: { SpeechRecognition: FakeRecognition, navigator: { language: 'fr-FR' } },
        setTimer: callback => {
            timers.push(callback);
            return callback;
        },
        clearTimer: () => {}
    });

    service.start({ targetId: 'source', language: 'zz-ZZ', onTranscript: () => {} });
    const unavailableLanguage = FakeRecognition.instances[0];
    assert.equal(unavailableLanguage.lang, 'zz-ZZ');

    unavailableLanguage.onerror({ error: 'language-not-supported' });
    unavailableLanguage.onend();
    timers.shift()();
    assert.equal(FakeRecognition.instances[1].lang, 'fr-FR');

    FakeRecognition.instances[1].onerror({ error: 'language-not-supported' });
    assert.deepEqual(service.getState(), { listening: false, targetId: null });
});

test('switches an active dictation session to its detected language without losing the session', () => {
    FakeRecognition.instances = [];
    const timers = [];
    const service = createSpeechRecognitionService({
        windowRef: { SpeechRecognition: FakeRecognition, navigator: { language: 'en-US' } },
        setTimer: callback => {
            timers.push(callback);
            return callback;
        },
        clearTimer: () => {}
    });

    service.start({ targetId: 'source', language: 'en-US', onTranscript: () => {} });
    const first = FakeRecognition.instances[0];
    assert.equal(service.updateLanguage('source', 'fr'), true);
    assert.equal(first.aborted, true);
    first.onend();
    timers.shift()();
    assert.equal(FakeRecognition.instances[1].lang, 'fr');
    assert.deepEqual(service.getState(), { listening: true, targetId: 'source' });
});
