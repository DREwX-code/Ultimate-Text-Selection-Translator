import { userscriptApi } from './userscript-api.js';
import { buildTranslationChunks } from './text-segmentation.js';
export function createSpeechService({
    request = userscriptApi.xmlHttpRequest,
    browserLanguage,
    createAudio = source => new Audio(source),
    createObjectUrl = blob => URL.createObjectURL(blob),
    revokeObjectUrl = url => URL.revokeObjectURL(url),
    createAudioBlob = response => new Blob([response], { type: 'audio/mpeg' }),
    allowBlobAudioFallback = false,
    createAudioContext = () => {
        const AudioContextConstructor = globalThis.AudioContext || globalThis.webkitAudioContext;
        return AudioContextConstructor ? new AudioContextConstructor() : null;
    },
    onStateChange
}) {
    let currentSpeakerId = null;
    let speechPlaying = false;
    let activeSpeechAudio = null;
    let activeSpeechAudioUrl = null;
    let audioContext = null;
    let activeSpeechBufferSource = null;
    let speechQueue = [];
    let speechFetchRequest = null;
    let speechRequestToken = 0;
    let speechFetchTimeout = null;

    function notifyStateChange() {
        onStateChange({
            playing: speechPlaying,
            speakerId: currentSpeakerId
        });
    }

    function normalizeSpeechLangTag(langTag) {
        return (langTag || '').toLowerCase().replace(/_/g, '-').trim();
    }

    function clearActiveSpeechAudio() {
        if (activeSpeechBufferSource) {
            activeSpeechBufferSource.onended = null;
            try { activeSpeechBufferSource.stop(0); } catch { /* Source may already have ended. */ }
            try { activeSpeechBufferSource.disconnect(); } catch { /* Source may already be disconnected. */ }
            activeSpeechBufferSource = null;
        }
        if (activeSpeechAudio) {
            activeSpeechAudio.onended = null;
            activeSpeechAudio.onerror = null;
            activeSpeechAudio.pause();
            activeSpeechAudio.src = '';
            activeSpeechAudio = null;
        }
        if (activeSpeechAudioUrl) {
            revokeObjectUrl(activeSpeechAudioUrl);
            activeSpeechAudioUrl = null;
        }
    }

    function getAudioContext() {
        if (audioContext) return audioContext;
        try {
            audioContext = createAudioContext();
        } catch {
            audioContext = null;
        }
        return audioContext;
    }

    function decodeAudioData(context, encodedAudio) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = value => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const fail = error => {
                if (settled) return;
                settled = true;
                reject(error);
            };
            try {
                const decoding = context.decodeAudioData(encodedAudio, finish, fail);
                if (decoding && typeof decoding.then === 'function') decoding.then(finish, fail);
            } catch (error) {
                fail(error);
            }
        });
    }

    async function playWithWebAudio(audioBlob, index, requestToken, langCandidates) {
        const context = getAudioContext();
        if (!context || !audioBlob?.arrayBuffer || typeof context.decodeAudioData !== 'function') return false;
        try {
            if (context.state === 'suspended') await context.resume?.();
            const encodedAudio = await audioBlob.arrayBuffer();
            const decodedAudio = await decodeAudioData(context, encodedAudio);
            if (requestToken !== speechRequestToken) return true;
            const source = context.createBufferSource();
            source.buffer = decodedAudio;
            source.connect(context.destination);
            activeSpeechBufferSource = source;
            source.onended = () => {
                if (activeSpeechBufferSource === source) activeSpeechBufferSource = null;
                playSpeechChunkAt(index + 1, requestToken, langCandidates);
            };
            source.start(0);
            return true;
        } catch {
            return false;
        }
    }

    function stopSpeaking() {
        speechRequestToken += 1;
        clearTimeout(speechFetchTimeout);
        if (speechFetchRequest && typeof speechFetchRequest.abort === 'function') {
            speechFetchRequest.abort();
        }
        speechFetchRequest = null;
        speechQueue = [];
        clearActiveSpeechAudio();
        speechPlaying = false;
        currentSpeakerId = null;
        notifyStateChange();
    }

    function normalizeGoogleTtsLang(langCode) {
        let normalized = normalizeSpeechLangTag(langCode);
        if (!normalized || normalized === 'auto' || normalized === 'navigator') {
            normalized = normalizeSpeechLangTag(browserLanguage || 'en');
        }
        if (normalized === 'zh-cn' || normalized === 'zh-sg') return 'zh-CN';
        if (normalized === 'zh-tw' || normalized === 'zh-hk') return 'zh-TW';
        if (normalized === 'pt-br') return 'pt-BR';
        return normalized;
    }

    function getGoogleTtsLanguageCandidates(langCode) {
        const normalized = normalizeGoogleTtsLang(langCode);
        const candidates = [normalized];
        const base = normalized.split('-')[0];
        if (base && !candidates.includes(base)) candidates.push(base);
        return candidates.filter(Boolean);
    }

    function splitTextForGoogleTts(text, maxChunkLength = 180) {
        const normalized = (text || '').replace(/\s+/g, ' ').trim();
        if (!normalized) return [];
        if (normalized.length <= maxChunkLength) return [normalized];

        return buildTranslationChunks(normalized, maxChunkLength);
    }

    function finishSpeechPlayback(requestToken) {
        if (requestToken !== speechRequestToken) return;
        clearTimeout(speechFetchTimeout);
        speechFetchRequest = null;
        speechQueue = [];
        clearActiveSpeechAudio();
        speechPlaying = false;
        currentSpeakerId = null;
        notifyStateChange();
    }

    function fetchGoogleTtsChunk(chunkText, langCandidates, requestToken, done) {
        if (!chunkText || !langCandidates.length || requestToken !== speechRequestToken) {
            done(null);
            return;
        }

        const tryCandidate = (index) => {
            if (requestToken !== speechRequestToken) {
                done(null);
                return;
            }
            if (index >= langCandidates.length) {
                done(null);
                return;
            }

            const candidateLang = langCandidates[index];
            const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(candidateLang)}&q=${encodeURIComponent(chunkText)}`;
            clearTimeout(speechFetchTimeout);
            speechFetchTimeout = setTimeout(() => {
                const pending = speechFetchRequest;
                finishSpeechPlayback(requestToken);
                pending?.abort?.();
            }, 12000);
            try {
                speechFetchRequest = request({
                    method: 'GET',
                    anonymous: true,
                    url,
                    responseType: 'arraybuffer',
                    timeout: 12000,
                    ontimeout: () => finishSpeechPlayback(requestToken),
                    onload: (response) => {
                        clearTimeout(speechFetchTimeout);
                        speechFetchRequest = null;
                        if (requestToken !== speechRequestToken) {
                            done(null);
                            return;
                        }
                        const status = Number(response.status) || 0;
                        const hasAudio = response.response && response.response.byteLength > 0;
                        if (status >= 200 && status < 300 && hasAudio) {
                            done(createAudioBlob(response.response));
                            return;
                        }
                        tryCandidate(index + 1);
                    },
                    onerror: () => {
                        clearTimeout(speechFetchTimeout);
                        speechFetchRequest = null;
                        if (requestToken !== speechRequestToken) {
                            done(null);
                            return;
                        }
                        tryCandidate(index + 1);
                    }
                });
            } catch { finishSpeechPlayback(requestToken); }
        };

        tryCandidate(0);
    }

    function playSpeechChunkAt(index, requestToken, langCandidates) {
        if (requestToken !== speechRequestToken) return;
        if (!speechQueue.length || index >= speechQueue.length) {
            finishSpeechPlayback(requestToken);
            return;
        }

        fetchGoogleTtsChunk(speechQueue[index], langCandidates, requestToken, async (audioBlob) => {
            if (requestToken !== speechRequestToken) return;
            if (!audioBlob) {
                finishSpeechPlayback(requestToken);
                return;
            }

            clearActiveSpeechAudio();
            if (await playWithWebAudio(audioBlob, index, requestToken, langCandidates)) return;
            if (requestToken !== speechRequestToken) return;
            // A page CSP often blocks media-src blob:. Web Audio is supported
            // by the target browsers, so do not trigger a noisy CSP violation
            // when decoding is unavailable. The legacy route is opt-in only.
            if (!allowBlobAudioFallback) {
                finishSpeechPlayback(requestToken);
                return;
            }
            activeSpeechAudioUrl = createObjectUrl(audioBlob);
            const audio = createAudio(activeSpeechAudioUrl);
            activeSpeechAudio = audio;
            audio.onended = () => {
                playSpeechChunkAt(index + 1, requestToken, langCandidates);
            };
            audio.onerror = () => {
                playSpeechChunkAt(index + 1, requestToken, langCandidates);
            };
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    finishSpeechPlayback(requestToken);
                });
            }
        });
    }

    function speak(text, lang, speakerId = null) {
        const value = (text || '').trim();
        if (!value) return;

        const sameSpeaker = speechPlaying && speakerId && speakerId === currentSpeakerId;
        if (sameSpeaker) {
            stopSpeaking();
            return;
        }

        stopSpeaking();

        speechQueue = splitTextForGoogleTts(value);
        if (!speechQueue.length) return;

        const requestToken = speechRequestToken;
        const langCandidates = getGoogleTtsLanguageCandidates(lang);

        currentSpeakerId = speakerId;
        speechPlaying = true;
        notifyStateChange();
        playSpeechChunkAt(0, requestToken, langCandidates);
    }

    return {
        speak,
        stopSpeaking
    };
}
