export function createFullscreenController({
    ui,
    panelUi,
    languageApi,
    translationApi,
    speechApi,
    layoutApi,
    selectionApi,
    languagePanelsApi,
    themeApi,
    panelApi,
    runtimeState,
    setLoaderState,
    writeSourceClipboardText,
    writeTargetClipboardText,
    setSourceFeedbackTimer,
    setTargetFeedbackTimer,
    setTranslationTimer,
    clearTimer
}) {
    const {
        fullscreenOverlay,
        fullscreenTitleEl,
        fullscreenClose,
        fullscreenSourceLangSelect,
        fullscreenTargetLangSelect,
        fullscreenSourceLangCurrent,
        fullscreenTargetLangCurrent,
        fullscreenSourceLangSearch,
        fullscreenTargetLangSearch,
        fullscreenSourceLangGrid,
        fullscreenTargetLangGrid,
        fullscreenSourceLangPanel,
        fullscreenTargetLangPanel,
        fullscreenSourceLabel,
        fullscreenTargetLabel,
        fullscreenSwap,
        fullscreenSource,
        fullscreenTarget,
        fullscreenLoadingOverlay,
        fullscreenLoadingTitle,
        fullscreenSourceCopy,
        fullscreenSourceSpeak,
        fullscreenTargetCopy,
        fullscreenTargetSpeak,
        fullscreenToggle
    } = ui;
    const { sourceLangSelect, targetLangSelect } = panelUi;
    const {
        getBrowserLanguage,
        getDefaultTargetLanguage,
        getOverlayLabels,
        getLanguageNames,
        getLanguageLabel,
        buildSourceLanguageOptionsHtml,
        buildTargetLanguageOptions,
        resolveTargetLanguageValue,
        resolveSourceSpeechLanguage,
        resolveTargetSpeechLanguage,
        ensureSelectValue,
        getLoaderTitleByMode
    } = languageApi;
    const { translateText } = translationApi;
    const { stopSpeaking, speak, getSpeechState } = speechApi;
    const {
        lockPageScrollForFullscreen,
        unlockPageScrollForFullscreen,
        resetFullscreenTextareaResize,
        syncFullscreenTextareaHeights,
        markFullscreenResizeStart
    } = layoutApi;
    const {
        hideSelectionBubble,
        hideBubbleCloseMenu,
        scheduleSelectionBubbleUpdate
    } = selectionApi;
    const {
        hideLanguagePanels,
        renderLanguageGrid,
        bindFullscreenLanguageSearchControls,
        bindFullscreenPanelTriggers
    } = languagePanelsApi;
    const {
        refreshLanguagePanelTheme,
        setButtonIconStroke,
        copyFeedbackStroke,
        applyIconThemeColors
    } = themeApi;
    const { syncPanelLoadingTitle } = panelApi;
    const {
        getDetectedSourceLanguage,
        setDetectedSourceLanguage,
        getCurrentResolvedTargetLanguage,
        setCurrentResolvedTargetLanguage,
        getCurrentSelectedText,
        getCurrentTranslatedText
    } = runtimeState;
    let fullscreenSwapRotation = 0;
    let fullscreenTranslateTimer = null;
    let fullscreenTranslateReason = 'translate';
    let fullscreenTranslateRequestId = 0;

    function getDetectedSourceLanguageLabel() {
        const detectedSourceLang = getDetectedSourceLanguage();
        if (!detectedSourceLang || detectedSourceLang === 'auto') return '';
        return getLanguageLabel(detectedSourceLang);
    }

    function getFullscreenSourceCurrentLabel(code) {
        if (code === 'auto') {
            const detectedLabel = getDetectedSourceLanguageLabel();
            const langNames = getLanguageNames();
            return detectedLabel ? `${langNames.auto} (${detectedLabel})` : (langNames.auto || 'Detect language');
        }
        return getLanguageLabel(code);
    }

    function updateFullscreenSourceCurrentLabel() {
        if (!fullscreenSourceLangCurrent || !fullscreenSourceLangSelect) return;
        const sourceCode = fullscreenSourceLangSelect.value || 'auto';
        fullscreenSourceLangCurrent.textContent = getFullscreenSourceCurrentLabel(sourceCode);
    }

    function updateFullscreenTargetCurrentLabel() {
        if (!fullscreenTargetLangCurrent || !fullscreenTargetLangSelect) return;
        const targetCode = fullscreenTargetLangSelect.value || getDefaultTargetLanguage();
        fullscreenTargetLangCurrent.textContent = getLanguageLabel(targetCode);
    }

    function ensureFullscreenTargetLanguageValid(preferred) {
        const defaultTargetLang = getDefaultTargetLanguage();
        if (!fullscreenTargetLangSelect) return resolveTargetLanguageValue(preferred, defaultTargetLang);
        const candidate = resolveTargetLanguageValue(preferred, defaultTargetLang);
        return ensureSelectValue(fullscreenTargetLangSelect, candidate);
    }

    function syncLoadingTitles() {
        syncPanelLoadingTitle();
        if (fullscreenLoadingTitle) {
            fullscreenLoadingTitle.textContent = getLoaderTitleByMode(
                fullscreenLoadingOverlay && fullscreenLoadingOverlay.dataset.mode ? fullscreenLoadingOverlay.dataset.mode : 'translate'
            );
        }
    }

    function setFullscreenLoading(active, mode = 'translate') {
        setLoaderState(fullscreenLoadingOverlay, fullscreenLoadingTitle, active, mode);
    }

    function updateFullscreenTexts() {
        const overlayLabels = getOverlayLabels();
        const langNames = getLanguageNames();
        if (fullscreenTitleEl) fullscreenTitleEl.textContent = overlayLabels.title;
        if (fullscreenSourceLabel) fullscreenSourceLabel.textContent = overlayLabels.source;
        if (fullscreenTargetLabel) fullscreenTargetLabel.textContent = overlayLabels.target;
        if (fullscreenToggle) fullscreenToggle.title = overlayLabels.open;
        if (fullscreenSourceLangSearch) fullscreenSourceLangSearch.placeholder = langNames.navigator;
        if (fullscreenTargetLangSearch) fullscreenTargetLangSearch.placeholder = langNames.navigator;
        syncLoadingTitles();
    }

    function refreshFullscreenLanguageSelects() {
        const defaultTargetLang = getDefaultTargetLanguage();
        if (fullscreenSourceLangSelect) {
            const prev = fullscreenSourceLangSelect.value || 'auto';
            const sourceLanguageOptionsHtml = buildSourceLanguageOptionsHtml();
            fullscreenSourceLangSelect.innerHTML = sourceLanguageOptionsHtml;
            fullscreenSourceLangSelect.value = fullscreenSourceLangSelect.querySelector(`option[value="${prev}"]`) ? prev : 'auto';
        }
        if (fullscreenTargetLangSelect) {
            const prev = fullscreenTargetLangSelect.value || defaultTargetLang;
            const refreshedTargetOptionsOverlay = buildTargetLanguageOptions(true);
            fullscreenTargetLangSelect.innerHTML = refreshedTargetOptionsOverlay;
            ensureFullscreenTargetLanguageValid(prev);
        }
        updateFullscreenSourceCurrentLabel();
        updateFullscreenTargetCurrentLabel();
    }

    function openFullscreenOverlay() {
        const defaultTargetLang = getDefaultTargetLanguage();
        hideSelectionBubble();
        hideBubbleCloseMenu();
        lockPageScrollForFullscreen();
        fullscreenOverlay.style.display = 'flex';
        fullscreenSource.value = getCurrentSelectedText() || '';
        fullscreenTarget.value = getCurrentTranslatedText() || '';
        if (fullscreenSourceLangSelect) {
            const srcVal = sourceLangSelect ? sourceLangSelect.value : 'auto';
            fullscreenSourceLangSelect.value = fullscreenSourceLangSelect.querySelector(`option[value="${srcVal}"]`) ? srcVal : 'auto';
        }
        if (fullscreenTargetLangSelect) {
            const tgtVal = targetLangSelect ? targetLangSelect.value : defaultTargetLang;
            ensureFullscreenTargetLanguageValid(tgtVal);
        }
        updateFullscreenSourceCurrentLabel();
        updateFullscreenTargetCurrentLabel();
        hideLanguagePanels();
        refreshLanguagePanelTheme();
        renderLanguageGrid(fullscreenSourceLangGrid, fullscreenSourceLangSearch, fullscreenSourceLangSelect, fullscreenSourceLangCurrent, fullscreenSourceLangPanel);
        renderLanguageGrid(fullscreenTargetLangGrid, fullscreenTargetLangSearch, fullscreenTargetLangSelect, fullscreenTargetLangCurrent, fullscreenTargetLangPanel);
        syncFullscreenTextareaHeights();
        if (!fullscreenTarget.value && fullscreenSource.value.trim()) {
            scheduleFullscreenTranslate(350, 'translate');
        }
    }

    function closeFullscreenOverlay() {
        fullscreenTranslateRequestId++;
        setFullscreenLoading(false);
        resetFullscreenTextareaResize();
        fullscreenOverlay.style.display = 'none';
        unlockPageScrollForFullscreen();
        stopSpeaking();
        scheduleSelectionBubbleUpdate(0);
    }

    function translateInFullscreen(reason = 'translate') {
        const defaultTargetLang = getDefaultTargetLanguage();
        const text = fullscreenSource.value || '';
        const target = fullscreenTargetLangSelect
            ? ensureFullscreenTargetLanguageValid(fullscreenTargetLangSelect.value)
            : (targetLangSelect ? targetLangSelect.value : defaultTargetLang);
        const srcLang = fullscreenSourceLangSelect ? fullscreenSourceLangSelect.value || 'auto' : 'auto';
        const requestId = ++fullscreenTranslateRequestId;
        if (!text.trim()) {
            setFullscreenLoading(false, reason === 'language' ? 'language' : 'translate');
            fullscreenTarget.value = '';
            return;
        }
        setFullscreenLoading(true, reason === 'language' ? 'language' : 'translate');
        translateText(text, srcLang, target, (translation, pos, resolvedTargetLang) => {
            if (requestId !== fullscreenTranslateRequestId) return;
            setFullscreenLoading(false, reason === 'language' ? 'language' : 'translate');
            fullscreenTarget.value = translation;
            setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
            updateFullscreenSourceCurrentLabel();
            updateFullscreenTargetCurrentLabel();
        }, { x: 0, y: 0 });
    }

    function scheduleFullscreenTranslate(delay = 250, reason = 'translate') {
        if (fullscreenTranslateTimer) clearTimer(fullscreenTranslateTimer);
        fullscreenTranslateReason = reason === 'language' ? 'language' : 'translate';
        fullscreenTranslateTimer = setTranslationTimer(() => {
            fullscreenTranslateTimer = null;
            translateInFullscreen(fullscreenTranslateReason);
        }, delay);
    }

    function updateLanguageGridCurrentLabel(currentLabelEl, code) {
        if (currentLabelEl === fullscreenSourceLangCurrent) {
            updateFullscreenSourceCurrentLabel();
        } else if (currentLabelEl === fullscreenTargetLangCurrent) {
            updateFullscreenTargetCurrentLabel();
        } else if (currentLabelEl) {
            currentLabelEl.textContent = getLanguageLabel(code);
        }
    }

    function applyLanguageGridSelection(code, selectEl) {
        const defaultTargetLang = getDefaultTargetLanguage();
        stopSpeaking();
        selectEl.value = code;
        if (selectEl === fullscreenTargetLangSelect) {
            const validTarget = ensureFullscreenTargetLanguageValid(code);
            setCurrentResolvedTargetLanguage(resolveTargetLanguageValue(
                validTarget,
                getCurrentResolvedTargetLanguage() || defaultTargetLang
            ));
        } else if (selectEl === fullscreenSourceLangSelect && code !== 'auto') {
            setDetectedSourceLanguage(code);
        }
    }

    function bindFullscreenActionControls() {
        if (fullscreenSourceCopy) fullscreenSourceCopy.addEventListener('click', () => {
            const text = fullscreenSource.value || '';
            if (!text) return;
            writeSourceClipboardText(text);
            const svg = fullscreenSourceCopy.querySelector('svg');
            if (svg) {
                setButtonIconStroke(fullscreenSourceCopy, copyFeedbackStroke);
                setSourceFeedbackTimer(() => { applyIconThemeColors(); }, 900);
            }
        });

        if (fullscreenTargetCopy) fullscreenTargetCopy.addEventListener('click', () => {
            const text = fullscreenTarget.value || '';
            if (!text) return;
            writeTargetClipboardText(text);
            const svg = fullscreenTargetCopy.querySelector('svg');
            if (svg) {
                setButtonIconStroke(fullscreenTargetCopy, copyFeedbackStroke);
                setTargetFeedbackTimer(() => { applyIconThemeColors(); }, 900);
            }
        });

        if (fullscreenSourceSpeak) fullscreenSourceSpeak.addEventListener('click', () => {
            const text = fullscreenSource.value.trim();
            if (!text) return;
            const { playing, speakerId } = getSpeechState();
            if (playing && speakerId === 'fs-source') {
                stopSpeaking();
                return;
            }
            const selectedSrc = fullscreenSourceLangSelect ? fullscreenSourceLangSelect.value : 'auto';
            const langForSpeech = resolveSourceSpeechLanguage(selectedSrc);
            speak(text, langForSpeech, 'fs-source');
        });

        if (fullscreenTargetSpeak) fullscreenTargetSpeak.addEventListener('click', () => {
            const defaultTargetLang = getDefaultTargetLanguage();
            const text = fullscreenTarget.value.trim();
            if (!text) return;
            const { playing, speakerId } = getSpeechState();
            if (playing && speakerId === 'fs-target') {
                stopSpeaking();
                return;
            }
            const selectedTarget = fullscreenTargetLangSelect ? fullscreenTargetLangSelect.value : (targetLangSelect ? targetLangSelect.value : defaultTargetLang);
            const tgtLang = resolveTargetSpeechLanguage(selectedTarget, getCurrentResolvedTargetLanguage());
            speak(text, tgtLang || getBrowserLanguage(), 'fs-target');
        });

        bindFullscreenLanguageSearchControls();
    }

    function bindFullscreenInputControls() {
        if (fullscreenSource) fullscreenSource.addEventListener('pointerdown', markFullscreenResizeStart);
        if (fullscreenTarget) fullscreenTarget.addEventListener('pointerdown', markFullscreenResizeStart);
        if (fullscreenSource) fullscreenSource.addEventListener('input', () => scheduleFullscreenTranslate(250, 'translate'));
        if (fullscreenSourceLangSelect) fullscreenSourceLangSelect.addEventListener('change', () => {
            if (fullscreenSourceLangSelect.value !== 'auto') {
                setDetectedSourceLanguage(fullscreenSourceLangSelect.value);
            }
            updateFullscreenSourceCurrentLabel();
            scheduleFullscreenTranslate(0, 'language');
        });
        if (fullscreenTargetLangSelect) fullscreenTargetLangSelect.addEventListener('change', () => {
            const defaultTargetLang = getDefaultTargetLanguage();
            const validTarget = ensureFullscreenTargetLanguageValid(fullscreenTargetLangSelect.value);
            setCurrentResolvedTargetLanguage(resolveTargetLanguageValue(
                validTarget,
                getCurrentResolvedTargetLanguage() || defaultTargetLang
            ));
            updateFullscreenTargetCurrentLabel();
            scheduleFullscreenTranslate(0, 'language');
        });
    }

    function swapFullscreenContent() {
        if (!fullscreenSource || !fullscreenTarget || !fullscreenSourceLangSelect || !fullscreenTargetLangSelect) return;
        const defaultTargetLang = getDefaultTargetLanguage();
        stopSpeaking();

        const srcText = fullscreenSource.value;
        fullscreenSource.value = fullscreenTarget.value;
        fullscreenTarget.value = srcText;

        const srcLang = fullscreenSourceLangSelect.value || 'auto';
        const tgtLang = fullscreenTargetLangSelect.value || defaultTargetLang;
        fullscreenSourceLangSelect.value = fullscreenSourceLangSelect.querySelector(`option[value="${tgtLang}"]`) ? tgtLang : 'auto';

        let swappedTargetLang = srcLang;
        if (swappedTargetLang === 'auto') {
            const detectedSourceLang = getDetectedSourceLanguage();
            swappedTargetLang = resolveTargetLanguageValue(
                (detectedSourceLang && detectedSourceLang !== 'auto') ? detectedSourceLang : getCurrentResolvedTargetLanguage(),
                defaultTargetLang
            );
        }

        const validTarget = ensureFullscreenTargetLanguageValid(swappedTargetLang);
        setCurrentResolvedTargetLanguage(resolveTargetLanguageValue(validTarget, defaultTargetLang));
        if (fullscreenSourceLangSelect.value !== 'auto') {
            setDetectedSourceLanguage(fullscreenSourceLangSelect.value);
        }

        updateFullscreenSourceCurrentLabel();
        updateFullscreenTargetCurrentLabel();

        scheduleFullscreenTranslate(0, 'language');
    }

    function bindFullscreenLanguageControls() {
        if (fullscreenSwap) {
            fullscreenSwap.addEventListener('click', () => {
                swapFullscreenContent();
                fullscreenSwapRotation += 360;
                fullscreenSwap.style.transform = `rotate(${fullscreenSwapRotation}deg)`;
            });
        }

        bindFullscreenPanelTriggers();
    }

    function bindFullscreenNavigationControls() {
        if (fullscreenToggle) fullscreenToggle.addEventListener('click', openFullscreenOverlay);
        if (fullscreenClose) fullscreenClose.addEventListener('click', closeFullscreenOverlay);
    }

    return {
        applyLanguageGridSelection,
        bindFullscreenActionControls,
        bindFullscreenInputControls,
        bindFullscreenLanguageControls,
        bindFullscreenNavigationControls,
        closeFullscreenOverlay,
        openFullscreenOverlay,
        refreshFullscreenLanguageSelects,
        scheduleFullscreenTranslate,
        updateFullscreenSourceCurrentLabel,
        updateFullscreenTexts,
        updateLanguageGridCurrentLabel
    };
}
