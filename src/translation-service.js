import { buildTranslationChunks } from './text-segmentation.js';

export function createTranslationService({
    request = GM_xmlhttpRequest,
    getErrorMessages,
    isSupportedDetectedLanguage,
    onDetectedLanguage
}) {
    function translateSentence(text, sourceLang, targetLang, callback) {
        if (!text || !text.trim()) {
            callback(text, null);
            return;
        }

        const leadingWhitespace = text.match(/^\s*/)[0];
        const trailingWhitespace = text.match(/\s*$/)[0];
        const textToTranslate = text.slice(leadingWhitespace.length, text.length - trailingWhitespace.length);

        request({
            method: 'GET',
            url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);

                    let detected = sourceLang;
                    if (sourceLang === 'auto') {
                        if (data[2]) {
                            detected = data[2];
                        } else if (data[8] && data[8][0] && data[8][0][0]) {
                            detected = data[8][0][0];
                        } else {
                            detected = '';
                        }
                    }

                    const translation = (data && data[0])
                        ? data[0].map(part => part && part[0] ? part[0] : '').join('')
                        : '';

                    callback(`${leadingWhitespace}${translation}${trailingWhitespace}`, detected || null);
                } catch (e) {
                    callback(`${leadingWhitespace}${getErrorMessages().translation}${trailingWhitespace}`, null);
                }
            },
            onerror: function () {
                callback(`${leadingWhitespace}${getErrorMessages().connection}${trailingWhitespace}`, null);
            }
        });
    }

    function translateText(text, sourceLang, targetLang, callback) {
        if (!text) {
            callback(getErrorMessages().noText, null);
            return;
        }

        if (!sourceLang || sourceLang === '') sourceLang = 'auto';

        const sentences = buildTranslationChunks(text);
        let translatedSentences = [];
        let completed = 0;
        let activeRequests = 0;
        let nextIndex = 0;
        const maxConcurrentRequests = 3;

        let runDetectedLang = null;

        function finishTranslationIfComplete() {
            if (completed !== sentences.length) return;
            onDetectedLanguage(runDetectedLang);

            const fullTranslation = translatedSentences.join('');
            callback(fullTranslation, targetLang);
        }

        function runNextTranslations() {
            while (activeRequests < maxConcurrentRequests && nextIndex < sentences.length) {
                const index = nextIndex++;
                const sentence = sentences[index];
                activeRequests++;

                translateSentence(sentence, sourceLang, targetLang, (translation, detected) => {
                    translatedSentences[index] = translation;
                    activeRequests--;
                    completed++;

                    if (!runDetectedLang && detected && isSupportedDetectedLanguage(detected)) {
                        runDetectedLang = detected;
                    }

                    finishTranslationIfComplete();
                    runNextTranslations();
                });
            }
        }

        if (!sentences.length) {
            callback('', targetLang);
            return;
        }

        runNextTranslations();
    }

    return { translateText };
}
