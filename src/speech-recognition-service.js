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

    function getInterimTranscript(results) {
        return [...results.entries()]
            .sort(([left], [right]) => left - right)
            .reduce((text, [, transcript]) => appendTranscript(text, transcript), '');
    }

    function clearRestartTimer() {
        if (!restartTimer) return;
        clearTimer(restartTimer);
        restartTimer = null;
    }

    function stop(targetId) {
        if (!session || (targetId && session.targetId !== targetId)) return false;
        const activeRecognition = recognition;
        const activeTargetId = session.targetId;
        sessionVersion++;
        session.shouldListen = false;
        clearRestartTimer();
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
        activeSession.finalResults = new Map();
        activeSession.interimResults = new Map();

        const recognitionLanguage = getRecognitionLanguage(activeSession.language);
        if (recognitionLanguage) instance.lang = recognitionLanguage;
        instance.continuous = true;
        instance.interimResults = !activeSession.finalResultsOnly;
        instance.maxAlternatives = 1;

        instance.onresult = event => {
            if (session !== activeSession || activeVersion !== sessionVersion || !activeSession.shouldListen) return;
            const resultIndex = Number.isInteger(event?.resultIndex) ? event.resultIndex : 0;
            const results = event?.results || [];
            for (let index = resultIndex; index < results.length; index++) {
                const result = results[index];
                const transcript = String(result?.[0]?.transcript || '').trim();
                if (!transcript || activeSession.finalResults.has(index)) continue;
                if (result?.isFinal) {
                    activeSession.finalResults.set(index, transcript);
                    activeSession.interimResults.delete(index);
                    activeSession.committedTranscript = appendTranscript(activeSession.committedTranscript, transcript);
                } else if (!activeSession.finalResultsOnly) {
                    activeSession.interimResults.set(index, transcript);
                }
            }
            const nextTranscript = activeSession.finalResultsOnly
                ? activeSession.committedTranscript
                : appendTranscript(activeSession.committedTranscript, getInterimTranscript(activeSession.interimResults));
            if (nextTranscript === activeSession.lastEmittedTranscript) return;
            activeSession.lastEmittedTranscript = nextTranscript;
            activeSession.onTranscript(nextTranscript);
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
            if (!activeSession.shouldListen || !activeSession.restartOnEnd) {
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

    function start({
        targetId,
        language,
        onTranscript,
        onError,
        finalResultsOnly = false,
        restartOnEnd = true
    }) {
        stop();
        if (!isSupported() || !targetId || typeof onTranscript !== 'function') {
            onError?.('unsupported');
            return false;
        }
        sessionVersion++;
        session = {
            targetId,
            language,
            onTranscript,
            onError,
            finalResultsOnly,
            restartOnEnd,
            usedBrowserLanguageFallback: false,
            shouldListen: true,
            committedTranscript: '',
            finalResults: new Map(),
            interimResults: new Map(),
            lastEmittedTranscript: ''
        };
        notify(true, targetId);
        beginRecognition();
        return true;
    }

    function toggle(options) {
        if (session?.targetId === options?.targetId) return stop(options.targetId);
        return start(options || {});
    }

    function getState() {
        return { listening: !!session?.shouldListen, targetId: session?.targetId || null };
    }

    return { getState, isSupported, start, stop, toggle };
}
