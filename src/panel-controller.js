export function createPanelController({
    windowRef,
    documentRef,
    ui,
    languageApi,
    translationApi,
    speechApi,
    layoutApi,
    selectionApi,
    themeApi,
    runtimeState,
    setLoaderState,
    eventPathContains,
    writeClipboardText,
    setTimer
}) {
    const {
        translationBox,
        sourceLangSelect,
        targetLangSelect,
        defaultTranslateLangSelect,
        translationText,
        panelLoadingOverlay,
        panelLoadingTitle,
        speakButton,
        speakTooltip,
        speakTranslated,
        speakOriginal,
        copyButton,
        settingsButton,
        backButton,
        closeButton,
        sourceAutoOption,
        translatorPanel,
        settingsPanel,
        settingsHeader,
        settingsHeaderTitle
    } = ui;
    const {
        getBrowserLanguage,
        getErrors,
        getPanelTexts,
        getSettingsTitle,
        getLoaderTitleByMode,
        getSavedTargetLanguage,
        ensureSelectValue,
        resolveSourceSpeechLanguage,
        resolveTargetSpeechLanguage
    } = languageApi;
    const { translateText } = translationApi;
    const {
        stopSpeaking,
        speak,
        getSpeechState
    } = speechApi;
    const { placeBoxAtSelection } = layoutApi;
    const {
        hideSelectionBubble,
        hideBubbleCloseMenu,
        scheduleSelectionBubbleUpdate
    } = selectionApi;
    const {
        setButtonIconStroke,
        copyFeedbackStroke,
        applyIconThemeColors
    } = themeApi;
    const {
        getCurrentSelectedText,
        setCurrentSelectedText,
        getCurrentTranslatedText,
        setCurrentTranslatedText,
        getCurrentResolvedTargetLanguage,
        setCurrentResolvedTargetLanguage,
        setDetectedSourceLanguage
    } = runtimeState;
    let panelTranslateRequestId = 0;

    function syncPanelLoadingTitle() {
        if (panelLoadingTitle) {
            panelLoadingTitle.textContent = getLoaderTitleByMode(
                panelLoadingOverlay && panelLoadingOverlay.dataset.mode ? panelLoadingOverlay.dataset.mode : 'translate'
            );
        }
    }

    function setPanelLoading(active, mode = 'translate') {
        setLoaderState(panelLoadingOverlay, panelLoadingTitle, active, mode);
    }

    function runPanelTranslation(text, sourceLang, targetLang, callback, position, loadingMode = 'translate') {
        const requestId = ++panelTranslateRequestId;
        setPanelLoading(true, loadingMode);
        translateText(text, sourceLang, targetLang, (translation, pos, resolvedTargetLang) => {
            if (requestId !== panelTranslateRequestId) return;
            setPanelLoading(false, loadingMode);
            callback(translation, pos, resolvedTargetLang);
        }, position);
    }

    function updateTranslatorTexts() {
        const {
            autoLabel,
            dragHandleLabel,
            listenTranslated,
            listenOriginal
        } = getPanelTexts();
        if (sourceAutoOption) sourceAutoOption.textContent = autoLabel;
        if (speakTranslated) speakTranslated.textContent = listenTranslated;
        if (speakOriginal) speakOriginal.textContent = listenOriginal;
        const dragLabelEl = translationBox.querySelector('#dragHandle span');
        if (dragLabelEl) dragLabelEl.textContent = dragHandleLabel;
    }

    function updateNoTextErrorMessage(previousErrors) {
        if (translationText && previousErrors && translationText.textContent === previousErrors.noText) {
            translationText.textContent = getErrors().noText;
        }
    }

    function openTranslationPanelForText(selectedText, selectionPosition) {
        stopSpeaking();
        sourceLangSelect.value = 'auto';
        setDetectedSourceLanguage('auto');

        if (translatorPanel) translatorPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (settingsHeader) settingsHeader.style.display = 'none';
        translationBox.classList.remove('utst-settings-open');

        hideSelectionBubble();
        hideBubbleCloseMenu();

        const text = (selectedText || '').trim();
        if (!text) {
            const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
            const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
            panelTranslateRequestId++;
            setPanelLoading(false);
            translationText.textContent = getErrors().noText;
            translationBox.style.display = 'block';
            translationBox.style.left = `${scrollX + windowRef.innerWidth / 2 - 150}px`;
            translationBox.style.top = `${scrollY + windowRef.innerHeight / 2 - 50}px`;
            translationBox.style.opacity = '1';
            translationBox.style.transform = 'translateY(0)';
            return;
        }

        setCurrentSelectedText(text);

        const savedTargetLang = getSavedTargetLanguage();
        const targetLangForSession = ensureSelectValue(targetLangSelect, savedTargetLang);
        ensureSelectValue(defaultTranslateLangSelect, savedTargetLang);

        const fallbackPosition = selectionPosition && Number.isFinite(selectionPosition.x) && Number.isFinite(selectionPosition.y)
            ? selectionPosition
            : { x: 0, y: 0 };

        translationText.textContent = '';
        placeBoxAtSelection(fallbackPosition);
        translationBox.style.display = 'block';
        translationBox.style.opacity = '1';
        translationBox.style.transform = 'translateY(0)';

        runPanelTranslation(text, 'auto', targetLangForSession, (translation, pos, resolvedTargetLang) => {
            setCurrentTranslatedText(translation);
            translationText.textContent = translation;
            setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
            placeBoxAtSelection(pos || fallbackPosition);
            hideSelectionBubble();
        }, fallbackPosition, 'translate');
    }

    function handleLanguageChange() {
        stopSpeaking();
        const targetVal = targetLangSelect.value;
        setCurrentResolvedTargetLanguage(targetVal === 'navigator' ? getBrowserLanguage() : targetVal);

        const sourceVal = sourceLangSelect.value;
        if (sourceVal !== 'auto') {
            setDetectedSourceLanguage(sourceVal);
        }

        if (getCurrentSelectedText()) {
            runPanelTranslation(getCurrentSelectedText(), sourceVal, targetVal, (translation, pos, resolvedTargetLang) => {
                setCurrentTranslatedText(translation);
                translationText.textContent = translation;
                setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
            }, { x: parseFloat(translationBox.style.left), y: parseFloat(translationBox.style.top) }, 'language');
        }
    }

    function bindPanelActionControls() {
        sourceLangSelect.addEventListener('change', handleLanguageChange);
        targetLangSelect.addEventListener('change', () => {
            ensureSelectValue(targetLangSelect, targetLangSelect.value);
            handleLanguageChange();
        });

        speakButton.addEventListener('mouseenter', () => {
            speakTooltip.style.display = 'block';
        });
        speakButton.addEventListener('mouseleave', () => {
            speakTooltip.style.display = 'none';
        });
        speakButton.addEventListener('click', (e) => {
            if (speakTooltip && eventPathContains(e, speakTooltip)) return;
            const { playing, speakerId } = getSpeechState();
            if (playing && speakerId && speakerId.startsWith('panel-')) {
                e.preventDefault();
                e.stopPropagation();
                stopSpeaking();
                speakTooltip.style.display = 'none';
            }
        });

        speakTranslated.addEventListener('click', (e) => {
            e.stopPropagation();
            if (getCurrentTranslatedText()) {
                const langForSpeech = resolveTargetSpeechLanguage(
                    targetLangSelect ? targetLangSelect.value : getCurrentResolvedTargetLanguage(),
                    getCurrentResolvedTargetLanguage()
                );
                speak(getCurrentTranslatedText(), langForSpeech, 'panel-translated');
            }
        });

        speakOriginal.addEventListener('click', (e) => {
            e.stopPropagation();
            if (getCurrentSelectedText()) {
                speak(
                    getCurrentSelectedText(),
                    resolveSourceSpeechLanguage(sourceLangSelect ? sourceLangSelect.value : 'auto'),
                    'panel-original'
                );
            }
        });

        copyButton.addEventListener('click', () => {
            if (getCurrentTranslatedText()) {
                writeClipboardText(getCurrentTranslatedText());
                setButtonIconStroke(copyButton, copyFeedbackStroke);
                setTimer(() => {
                    applyIconThemeColors();
                }, 1000);
            }
        });
    }

    function lockPanelDimensions() {
        if (!translationBox || translationBox.style.display !== 'block') return;
        const styles = windowRef.getComputedStyle(translationBox);
        const width = parseFloat(styles.width);
        const height = parseFloat(styles.height);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
        translationBox.style.width = `${width}px`;
        translationBox.style.minWidth = `${width}px`;
        translationBox.style.maxWidth = `${width}px`;
        translationBox.style.height = `${height}px`;
        translationBox.style.minHeight = `${height}px`;
        translationBox.style.maxHeight = `${height}px`;
    }

    function bindPanelNavigationControls() {
        closeButton.addEventListener('click', () => {
            panelTranslateRequestId++;
            setPanelLoading(false);
            translationBox.style.display = 'none';
            translationBox.style.opacity = '0';
            translationBox.style.transform = 'translateY(10px)';
            sourceLangSelect.value = 'auto';
            setDetectedSourceLanguage('auto');
            stopSpeaking();

            if (translatorPanel) translatorPanel.style.display = 'block';
            if (settingsPanel) settingsPanel.style.display = 'none';
            if (settingsHeader) settingsHeader.style.display = 'none';
            translationBox.classList.remove('utst-settings-open');
            scheduleSelectionBubbleUpdate(0);
        });

        settingsButton.addEventListener('click', () => {
            lockPanelDimensions();

            if (translatorPanel) translatorPanel.style.display = 'none';
            if (settingsPanel) settingsPanel.style.display = 'block';

            if (settingsHeaderTitle) settingsHeaderTitle.textContent = getSettingsTitle();
            if (settingsHeader) settingsHeader.style.display = 'flex';
            translationBox.classList.remove('utst-settings-open');
        });

        backButton.addEventListener('click', () => {
            if (translatorPanel) translatorPanel.style.display = 'block';
            if (settingsPanel) settingsPanel.style.display = 'none';

            if (settingsHeader) settingsHeader.style.display = 'none';
            translationBox.classList.remove('utst-settings-open');
        });
    }

    function closeTranslationBoxFromOutside() {
        panelTranslateRequestId++;
        setPanelLoading(false);
        translationBox.style.display = 'none';
        translationBox.style.opacity = '0';
        translationBox.style.transform = 'translateY(10px)';
        sourceLangSelect.value = 'auto';
        setDetectedSourceLanguage('auto');
        if (settingsHeader) settingsHeader.style.display = 'none';
        translationBox.classList.remove('utst-settings-open');
        stopSpeaking();
        scheduleSelectionBubbleUpdate(0);
    }

    function adjustBoxPosition() {
        const rect = translationBox.getBoundingClientRect();
        if (rect.right > windowRef.innerWidth) {
            translationBox.style.left = `${windowRef.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > windowRef.innerHeight) {
            translationBox.style.top = `${windowRef.innerHeight - rect.height - 10}px`;
        }
    }

    function bindPanelOutsideControls(isClickInProtectedOverlay) {
        function handleOutsideMouseDown(event) {
            if (isClickInProtectedOverlay(event) || eventPathContains(event, translationBox)) return;
            closeTranslationBoxFromOutside();
        }

        documentRef.addEventListener('mousedown', handleOutsideMouseDown);
        translationBox.addEventListener('transitionend', adjustBoxPosition);
    }

    return {
        bindPanelActionControls,
        bindPanelNavigationControls,
        bindPanelOutsideControls,
        handleLanguageChange,
        openTranslationPanelForText,
        syncPanelLoadingTitle,
        updateNoTextErrorMessage,
        updateTranslatorTexts
    };
}
