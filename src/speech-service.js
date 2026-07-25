export function createSpeechService({
    request = GM_xmlhttpRequest,
    browserLanguage,
    createAudio = source => new Audio(source),
    createObjectUrl = blob => URL.createObjectURL(blob),
    revokeObjectUrl = url => URL.revokeObjectURL(url),
    createAudioBlob = response => new Blob([response], { type: 'audio/mpeg' }),
    onStateChange
}) {
    let currentSpeakerId = null;
    let speechPlaying = false;
    let activeSpeechAudio = null;
    let activeSpeechAudioUrl = null;
    let speechQueue = [];
    let speechFetchRequest = null;
    let speechRequestToken = 0;

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

    function stopSpeaking() {
        speechRequestToken += 1;
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

        const chunks = [];
        const sentences = normalized.match(/[^.!?]+[.!?]*/g) || [normalized];

        sentences.forEach((sentenceRaw) => {
            const sentence = sentenceRaw.trim();
            if (!sentence) return;
            if (sentence.length <= maxChunkLength) {
                chunks.push(sentence);
                return;
            }
            const words = sentence.split(' ');
            let current = '';
            words.forEach((word) => {
                if (!word) return;
                if (word.length > maxChunkLength) {
                    if (current) {
                        chunks.push(current);
                        current = '';
                    }
                    for (let i = 0; i < word.length; i += maxChunkLength) {
                        chunks.push(word.slice(i, i + maxChunkLength));
                    }
                    return;
                }
                const next = current ? `${current} ${word}` : word;
                if (next.length > maxChunkLength) {
                    if (current) chunks.push(current);
                    current = word;
                } else {
                    current = next;
                }
            });
            if (current) chunks.push(current);
        });

        return chunks.filter(Boolean);
    }

    function finishSpeechPlayback(requestToken) {
        if (requestToken !== speechRequestToken) return;
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
            speechFetchRequest = request({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                onload: (response) => {
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
                    speechFetchRequest = null;
                    if (requestToken !== speechRequestToken) {
                        done(null);
                        return;
                    }
                    tryCandidate(index + 1);
                }
            });
        };

        tryCandidate(0);
    }

    function playSpeechChunkAt(index, requestToken, langCandidates) {
        if (requestToken !== speechRequestToken) return;
        if (!speechQueue.length || index >= speechQueue.length) {
            finishSpeechPlayback(requestToken);
            return;
        }

        fetchGoogleTtsChunk(speechQueue[index], langCandidates, requestToken, (audioBlob) => {
            if (requestToken !== speechRequestToken) return;
            if (!audioBlob) {
                finishSpeechPlayback(requestToken);
                return;
            }

            clearActiveSpeechAudio();
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
                    playSpeechChunkAt(index + 1, requestToken, langCandidates);
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
