export function createSpeechRecognitionService({
    windowRef,
    onStateChange = () => {},
    setTimer = (callback, delay) => setTimeout(callback, delay),
    clearTimer = timerId => clearTimeout(timerId)
}) {
    const Recognition = windowRef?.SpeechRecognition || windowRef?.webkitSpeechRecognition;
    let recognition = null;
    let session = null;
    let restartTimer = null;
    let sessionVersion = 0;

    function isSupported() {
        return typeof Recognition === 'function';
    }

    function notify(listening, targetId = null) {
        onStateChange({ listening, targetId });
    }

    function appendTranscript(current, addition) {
        if (!addition) return current;
        if (!current) return addition.trimStart();
        if (/\s$/.test(current) || /^\s|^[,.;:!?]/.test(addition)) return `${current}${addition}`;
        return `${current} ${addition}`;
    }

    function getBrowserRecognitionLanguage() {
        const language = windowRef?.navigator?.language || 'en-US';
        return /^[a-z]{2,3}(?:-[a-zA-Z]{2,4})?$/i.test(language) ? language : 'en-US';
    }

    function getRecognitionLanguage(language) {
        const candidate = String(language || '').trim();
        if (!candidate || candidate === 'auto' || candidate === 'navigator') return '';
        return /^[a-z]{2,3}(?:-[a-zA-Z]{2,4})?$/i.test(candidate)
            ? candidate
            : getBrowserRecognitionLanguage();
    }

    function stop(targetId) {
        if (!session || (targetId && session.targetId !== targetId)) return false;
        const activeRecognition = recognition;
        const activeTargetId = session.targetId;
        sessionVersion++;
        session.shouldListen = false;
        if (restartTimer) {
            clearTimer(restartTimer);
            restartTimer = null;
        }
        recognition = null;
        session = null;
        try {
            activeRecognition?.abort?.();
        } catch {
            activeRecognition?.stop?.();
        }
        notify(false, activeTargetId);
        return true;
    }

    function beginRecognition() {
        if (!session?.shouldListen || !isSupported()) return;
        const activeSession = session;
        const activeVersion = sessionVersion;
        const instance = new Recognition();
        recognition = instance;
        const recognitionLanguage = getRecognitionLanguage(activeSession.language);
        if (recognitionLanguage) instance.lang = recognitionLanguage;
        instance.continuous = true;
        instance.interimResults = true;
        instance.maxAlternatives = 1;

        instance.onresult = event => {
            if (session !== activeSession || activeVersion !== sessionVersion || !activeSession.shouldListen) return;
            let finalSegment = '';
            let interimSegment = '';
            for (let index = 0; index < event.results.length; index++) {
                const result = event.results[index];
                const transcript = result?.[0]?.transcript || '';
                if (result?.isFinal) finalSegment = appendTranscript(finalSegment, transcript);
                else interimSegment = appendTranscript(interimSegment, transcript);
            }
            activeSession.finalSegment = finalSegment;
            activeSession.interimSegment = interimSegment;
            const completed = appendTranscript(activeSession.committedTranscript, finalSegment);
            activeSession.onTranscript(appendTranscript(completed, interimSegment).trim());
        };

        instance.onerror = event => {
            if (session !== activeSession || activeVersion !== sessionVersion || !activeSession.shouldListen) return;
            const error = event?.error || 'unknown';
            if (error === 'no-speech' || error === 'aborted') return;
            if (error === 'language-not-supported' && !activeSession.usedBrowserLanguageFallback) {
                activeSession.language = getBrowserRecognitionLanguage();
                activeSession.usedBrowserLanguageFallback = true;
                return;
            }
            activeSession.shouldListen = false;
            recognition = null;
            session = null;
            activeSession.onError?.(error);
            notify(false, activeSession.targetId);
        };

        instance.onend = () => {
            if (session !== activeSession || activeVersion !== sessionVersion) return;
            recognition = null;
            activeSession.committedTranscript = appendTranscript(
                activeSession.committedTranscript,
                activeSession.finalSegment || activeSession.interimSegment
            );
            activeSession.finalSegment = '';
            activeSession.interimSegment = '';
            if (!activeSession.shouldListen) {
                session = null;
                notify(false, activeSession.targetId);
                return;
            }
            restartTimer = setTimer(() => {
                restartTimer = null;
                if (session !== activeSession || activeVersion !== sessionVersion || !activeSession.shouldListen) return;
                beginRecognition();
            }, 120);
        };

        try {
            instance.start();
        } catch (error) {
            activeSession.shouldListen = false;
            recognition = null;
            session = null;
            activeSession.onError?.(error?.name || 'start-failed');
            notify(false, activeSession.targetId);
        }
    }

    function start({ targetId, language, onTranscript, onError }) {
        stop();
        if (!isSupported() || !targetId || typeof onTranscript !== 'function') {
            onError?.('unsupported');
            return false;
        }
        sessionVersion++;
        session = {
            version: sessionVersion,
            targetId,
            language,
            onTranscript,
            onError,
            usedBrowserLanguageFallback: false,
            shouldListen: true,
            committedTranscript: '',
            finalSegment: '',
            interimSegment: ''
        };
        notify(true, targetId);
        beginRecognition();
        return true;
    }

    function updateLanguage(targetId, language) {
        if (!session || session.targetId !== targetId || !session.shouldListen) return false;
        const nextLanguage = getRecognitionLanguage(language);
        if (getRecognitionLanguage(session.language) === nextLanguage) return false;
        session.language = nextLanguage;
        session.usedBrowserLanguageFallback = false;
        if (restartTimer) {
            clearTimer(restartTimer);
            restartTimer = null;
        }
        try {
            recognition?.abort?.();
        } catch {
            recognition?.stop?.();
        }
        return true;
    }

    function toggle(options) {
        if (session?.targetId === options?.targetId) return stop(options.targetId);
        return start(options || {});
    }

    function getState() {
        return { listening: !!session?.shouldListen, targetId: session?.targetId || null };
    }

    return { getState, isSupported, start, stop, toggle, updateLanguage };
}
