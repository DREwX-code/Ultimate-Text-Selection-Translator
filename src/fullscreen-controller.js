export function createFullscreenController({
    ui,
    panelUi,
    languageApi,
    translationApi,
    speechApi,
    dictationApi,
    layoutApi,
    selectionApi,
    languagePanelsApi,
    themeApi,
    panelApi,
    runtimeState,
    setLoaderState,
    writeSourceClipboardText,
    writeTargetClipboardText,
    setTranslationTimer,
    clearTimer
}) {
    const {
        fullscreenOverlay,
        fullscreenTitleEl,
        fullscreenClose,
        fullscreenSettings,
        fullscreenResizeHandle,
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
        fullscreenSourceDictate,
        fullscreenTargetCopy,
        fullscreenTargetSpeak,
        fullscreenToggle,
        translationBox,
        settingsPanel
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
        resolveSourceDictationLanguage,
        resolveTargetSpeechLanguage,
        ensureSelectValue,
        getLoaderTitleByMode
    } = languageApi;
    const { translateText } = translationApi;
    const { stopSpeaking, speak, getSpeechState } = speechApi;
    const {
        isSupported: isDictationSupported = () => false,
        toggleDictation = () => false,
        stopDictation = () => false
    } = dictationApi || {};
    const {
        lockPageScrollForFullscreen,
        unlockPageScrollForFullscreen,
        resetFullscreenTextareaResize,
        syncFullscreenTextareaHeights,
        markFullscreenResizeStart,
        isSidePanelViewport = () => false,
        getSidePanelWidth = () => 0,
        setSidePanelWidth = () => 0
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
        applyIconThemeColors,
        showCopyFeedback
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
    let cancelTranslation = () => {};
    let composing = false;
    let previousFocus = null;
    const retry = fullscreenSource.ownerDocument.createElement('button');
    retry.type = 'button';
    retry.textContent = '↻';
    retry.title = 'Retry / Réessayer';
    retry.setAttribute('aria-label', retry.title);
    retry.hidden = true;
    const errorStatus = fullscreenSource.ownerDocument.createElement('div');
    errorStatus.setAttribute('role', 'alert');
    fullscreenTarget.parentElement.after(errorStatus, retry);
    retry.addEventListener('click', () => scheduleFullscreenTranslate(0));
    fullscreenSource.dir = fullscreenTarget.dir = 'auto';
    let fullscreenSwapRotation = 0;
    let fullscreenTranslateTimer = null;
    let fullscreenTranslateReason = 'translate';
    let fullscreenTranslateRequestId = 0;
    let popupSnapshot = null;
    let drawerSettingsParent = null;
    let drawerSettingsNextSibling = null;
    let drawerSettingsDisplay = '';
    let drawerResizeActive = false;
    let drawerResizeWidth = 0;
    let actionControlsBound = false;
    const documentRef = fullscreenOverlay.ownerDocument;
    const windowRef = documentRef.defaultView;

    function captureTextareaInsertion(textarea) {
        const text = textarea.value || '';
        const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : text.length;
        const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start;
        const safeStart = Math.max(0, Math.min(text.length, start));
        const safeEnd = Math.max(safeStart, Math.min(text.length, end));
        const prefix = text.slice(0, safeStart);
        const suffix = text.slice(safeEnd);
        const followEnd = safeEnd === text.length;
        return transcript => {
            textarea.value = `${prefix}${transcript}${suffix}`;
            const caret = prefix.length + transcript.length;
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(caret, caret);
            if (followEnd) windowRef.requestAnimationFrame(() => { textarea.scrollTop = textarea.scrollHeight; });
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        };
    }

    function usePopupSettingsIcon() {
        const popupIcon = translationBox?.querySelector('#settingsButton svg');
        if (!popupIcon || !fullscreenSettings) return;
        fullscreenSettings.replaceChildren(popupIcon.cloneNode(true));
        applyIconThemeColors();
    }

    usePopupSettingsIcon();

    function getSidePanelLabels(overlayLabels) {
        return {
            title: overlayLabels.sidePanelTitle || 'Translation panel',
            open: overlayLabels.sidePanelOpen || 'Open translation panel'
        };
    }

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
        const sidePanelLabels = getSidePanelLabels(overlayLabels);
        const settingsTitle = translationBox?.querySelector('#settingsHeaderTitle')?.textContent || 'Settings';
        if (fullscreenTitleEl) fullscreenTitleEl.textContent = isSidePanelViewport() ? 'UTST' : overlayLabels.title;
        if (fullscreenSourceLabel) fullscreenSourceLabel.textContent = overlayLabels.source;
        if (fullscreenTargetLabel) fullscreenTargetLabel.textContent = overlayLabels.target;
        if (fullscreenToggle) fullscreenToggle.title = isSidePanelViewport() ? sidePanelLabels.open : overlayLabels.open;
        if (fullscreenSettings) {
            fullscreenSettings.title = settingsTitle;
            fullscreenSettings.setAttribute('aria-label', settingsTitle);
        }
        if (fullscreenSourceLangSearch) fullscreenSourceLangSearch.placeholder = langNames.navigator;
        if (fullscreenTargetLangSearch) fullscreenTargetLangSearch.placeholder = langNames.navigator;
        syncLoadingTitles();
    }

    function hidePopupForSidePanel() {
        if (!translationBox || popupSnapshot) return;
        popupSnapshot = {
            display: translationBox.style.display,
            opacity: translationBox.style.opacity,
            transform: translationBox.style.transform
        };
        translationBox.style.display = 'none';
        translationBox.style.opacity = '0';
        translationBox.style.transform = 'translateY(10px)';
    }

    function restorePopupAfterSidePanel() {
        if (!translationBox || !popupSnapshot) return;
        translationBox.style.display = popupSnapshot.display;
        translationBox.style.opacity = popupSnapshot.opacity;
        translationBox.style.transform = popupSnapshot.transform;
        popupSnapshot = null;
    }

    function showDrawerSettings() {
        if (!isSidePanelViewport() || !settingsPanel || !translationBox) return;
        if (fullscreenOverlay.classList.contains('utst-drawer-settings-open')) {
            hideDrawerSettings();
            return;
        }
        drawerSettingsParent = settingsPanel.parentNode;
        drawerSettingsNextSibling = settingsPanel.nextSibling;
        drawerSettingsDisplay = settingsPanel.style.display;
        fullscreenOverlay.classList.add('utst-drawer-settings-open');
        hideLanguagePanels();
        settingsPanel.style.display = 'block';
        fullscreenOverlay.querySelector('#fullscreenPanel').appendChild(settingsPanel);
        fullscreenSettings?.setAttribute('aria-pressed', 'true');
        fullscreenSettings?.focus({ preventScroll: true });
    }

    function hideDrawerSettings() {
        if (!settingsPanel || !drawerSettingsParent) return;
        drawerSettingsParent.insertBefore(settingsPanel, drawerSettingsNextSibling);
        settingsPanel.style.display = drawerSettingsDisplay || 'none';
        fullscreenOverlay.classList.remove('utst-drawer-settings-open');
        fullscreenSettings?.setAttribute('aria-pressed', 'false');
        drawerSettingsParent = null;
        drawerSettingsNextSibling = null;
        drawerSettingsDisplay = '';
    }

    function updateDrawerWidth(clientX, persist = false) {
        if (!windowRef) return;
        drawerResizeWidth = setSidePanelWidth(windowRef.innerWidth - clientX, { persist });
        fullscreenOverlay.style.setProperty('--utst-side-panel-width', `${drawerResizeWidth}px`);
    }

    function stopDrawerResize() {
        if (!drawerResizeActive) return;
        drawerResizeActive = false;
        fullscreenOverlay.classList.remove('utst-side-resizing');
        if (drawerResizeWidth) setSidePanelWidth(drawerResizeWidth, { persist: true });
        documentRef.removeEventListener('pointermove', onDrawerResizeMove);
        documentRef.removeEventListener('pointerup', stopDrawerResize);
        documentRef.removeEventListener('pointercancel', stopDrawerResize);
    }

    function onDrawerResizeMove(event) {
        if (!drawerResizeActive) return;
        event.preventDefault();
        updateDrawerWidth(event.clientX);
    }

    function startDrawerResize(event) {
        if (!isSidePanelViewport() || !fullscreenOverlay.classList.contains('utst-side-panel')) return;
        if (event.button !== 0) return;
        event.preventDefault();
        drawerResizeActive = true;
        fullscreenOverlay.classList.add('utst-side-resizing');
        try {
            fullscreenResizeHandle?.setPointerCapture?.(event.pointerId);
        } catch {
            // Document listeners continue the resize when pointer capture is unavailable.
        }
        updateDrawerWidth(event.clientX);
        documentRef.addEventListener('pointermove', onDrawerResizeMove);
        documentRef.addEventListener('pointerup', stopDrawerResize);
        documentRef.addEventListener('pointercancel', stopDrawerResize);
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
        const sidePanel = isSidePanelViewport();
        stopDictation();
        hideSelectionBubble();
        hideBubbleCloseMenu();
        previousFocus = fullscreenOverlay.getRootNode().activeElement;
        fullscreenOverlay.classList.remove('utst-side-panel-entering');
        fullscreenOverlay.classList.toggle('utst-side-panel', sidePanel);
        if (sidePanel) {
            fullscreenOverlay.classList.add('utst-side-panel-entering');
            fullscreenOverlay.style.setProperty('--utst-side-panel-width', `${getSidePanelWidth()}px`);
        }
        updateFullscreenTexts();
        lockPageScrollForFullscreen();
        if (sidePanel) hidePopupForSidePanel();
        fullscreenOverlay.style.display = 'flex';
        fullscreenClose.focus({ preventScroll: true });
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
        cancelTranslation();
        clearTimer(fullscreenTranslateTimer);
        fullscreenTranslateTimer = null;
        fullscreenTranslateRequestId++;
        setFullscreenLoading(false);
        resetFullscreenTextareaResize();
        stopDrawerResize();
        hideDrawerSettings();
        fullscreenOverlay.style.display = 'none';
        fullscreenOverlay.classList.remove('utst-side-panel-entering');
        fullscreenOverlay.classList.remove('utst-side-panel');
        unlockPageScrollForFullscreen();
        restorePopupAfterSidePanel();
        previousFocus?.focus?.({ preventScroll: true });
        stopSpeaking();
        stopDictation('fullscreen-source');
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
        cancelTranslation = translateText(text, srcLang, target, (translation, pos, resolvedTargetLang, error, _detectedLanguage) => {
            if (requestId !== fullscreenTranslateRequestId) return;
            setFullscreenLoading(false, reason === 'language' ? 'language' : 'translate');
            fullscreenTarget.value = error ? '' : translation;
            errorStatus.textContent = error?.message || '';
            retry.hidden = !error;
            setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
            updateFullscreenSourceCurrentLabel();
            updateFullscreenTargetCurrentLabel();
        }, { x: 0, y: 0 });
    }

    function scheduleFullscreenTranslate(delay = 250, reason = 'translate') {
        cancelTranslation();
        fullscreenTranslateRequestId++;
        retry.hidden = true;
        errorStatus.textContent = '';
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
        if (actionControlsBound) return;
        actionControlsBound = true;
        if (fullscreenSourceDictate) fullscreenSourceDictate.addEventListener('click', () => {
            if (!isDictationSupported() || fullscreenSourceDictate.disabled) return;
            const selectedSource = fullscreenSourceLangSelect ? fullscreenSourceLangSelect.value : 'auto';
            const detectedSource = getDetectedSourceLanguage();
            const recognitionLanguage = resolveSourceDictationLanguage(selectedSource, detectedSource);
            const mobile = windowRef.matchMedia?.('(pointer: coarse) and (hover: none)').matches === true;
            toggleDictation({
                targetId: 'fullscreen-source',
                language: recognitionLanguage,
                onTranscript: captureTextareaInsertion(fullscreenSource),
                finalResultsOnly: mobile,
                restartOnEnd: !mobile
            });
        });

        if (fullscreenSourceCopy) fullscreenSourceCopy.addEventListener('click', async () => {
            const text = fullscreenSource.value || '';
            if (!text) return;
            if (!await writeSourceClipboardText(text)) { fullscreenSource.focus(); fullscreenSource.select(); return; }
            showCopyFeedback(fullscreenSourceCopy);
        });

        if (fullscreenTargetCopy) fullscreenTargetCopy.addEventListener('click', async () => {
            const text = fullscreenTarget.value || '';
            if (!text) return;
            if (!await writeTargetClipboardText(text)) { fullscreenTarget.focus(); fullscreenTarget.select(); return; }
            showCopyFeedback(fullscreenTargetCopy);
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
        if (fullscreenSource) {
            fullscreenSource.addEventListener('compositionstart', () => { composing = true; cancelTranslation(); clearTimer(fullscreenTranslateTimer); fullscreenTranslateRequestId++; });
            fullscreenSource.addEventListener('compositionend', () => { composing = false; scheduleFullscreenTranslate(350); });
            fullscreenSource.addEventListener('input', () => {
                if (!(fullscreenSource.value || '').trim()) {
                    if (fullscreenSourceLangSelect) fullscreenSourceLangSelect.value = 'auto';
                    setDetectedSourceLanguage('auto');
                    updateFullscreenSourceCurrentLabel();
                }
                if (!composing) scheduleFullscreenTranslate(350);
            });
        }
        fullscreenOverlay.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.stopPropagation(); closeFullscreenOverlay(); }
        });
        if (fullscreenSourceLangSelect) fullscreenSourceLangSelect.addEventListener('change', () => {
            stopDictation('fullscreen-source');
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
                fullscreenSwapRotation += 180;
                fullscreenSwap.style.setProperty('--utst-swap-rot', `${fullscreenSwapRotation}deg`);
            });
        }

        bindFullscreenPanelTriggers();
    }

    function bindFullscreenNavigationControls() {
        if (fullscreenToggle) fullscreenToggle.addEventListener('click', openFullscreenOverlay);
        if (fullscreenClose) fullscreenClose.addEventListener('click', closeFullscreenOverlay);
        if (fullscreenSettings) fullscreenSettings.addEventListener('click', showDrawerSettings);
        if (fullscreenResizeHandle) fullscreenResizeHandle.addEventListener('pointerdown', startDrawerResize);
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
