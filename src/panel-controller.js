export function createPanelController({
    windowRef,
    documentRef,
    ui,
    languageApi,
    translationApi,
    speechApi,
    dictationApi,
    layoutApi,
    selectionApi,
    themeApi,
    runtimeState,
    setLoaderState,
    eventPathContains,
    writeClipboardText,
    closeOpenMenus = () => {}
}) {
    const {
        translationBox,
        sourceLangSelect,
        targetLangSelect,
        defaultTranslateLangSelect,
        translationText,
        panelSourceText,
        panelSourceLanguageLabel,
        panelTargetLanguageLabel,
        panelSourceCopy,
        panelSourceSpeak,
        panelSourceDictate,
        panelDictate,
        panelLoadingOverlay,
        panelLoadingTitle,
        speakButton,
        speakControl,
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
        resolveSourceDictationLanguage,
        resolveTargetSpeechLanguage,
        getLanguageLabel
    } = languageApi;
    const { translateText } = translationApi;
    const {
        stopSpeaking,
        speak,
        getSpeechState
    } = speechApi;
    const {
        isSupported: isDictationSupported = () => false,
        toggleDictation = () => false,
        stopDictation = () => false
    } = dictationApi || {};
    const { placeBoxAtSelection, restorePopupOverflow = () => {} } = layoutApi;
    const {
        hideSelectionBubble,
        hideBubbleCloseMenu,
        scheduleSelectionBubbleUpdate
    } = selectionApi;
    const {
        showCopyFeedback
    } = themeApi;
    const {
        getCurrentSelectedText,
        setCurrentSelectedText,
        getCurrentTranslatedText,
        setCurrentTranslatedText,
        getCurrentResolvedTargetLanguage,
        setCurrentResolvedTargetLanguage,
        setDetectedSourceLanguage,
        getDetectedSourceLanguage
    } = runtimeState;
    let panelTranslateRequestId = 0;
    let cancelTranslation = () => {};
    let sourceEditTimer = 0;
    let translatedTextIsManual = false;
    let lastPanelEditable = translationText;
    const savedCaretPositions = new WeakMap();
    const retry = documentRef.createElement('button');
    retry.type = 'button';
    retry.textContent = '↻';
    retry.title = 'Retry / Réessayer';
    retry.setAttribute('aria-label', retry.title);
    retry.hidden = true;
    translationText.after(retry);
    retry.addEventListener('click', handleLanguageChange);
    translationText.tabIndex = 0;
    translationText.setAttribute('dir', 'auto');
    translationText.setAttribute('aria-live', 'polite');

    function isRangeInElement(range, element) {
        if (!range || !element) return false;
        const includes = node => node === element || element.contains(node);
        return includes(range.startContainer) && includes(range.endContainer);
    }

    function getRangeOffsets(element, range) {
        if (!isRangeInElement(range, element)) return null;
        const beforeStart = documentRef.createRange();
        beforeStart.selectNodeContents(element);
        beforeStart.setEnd(range.startContainer, range.startOffset);
        const beforeEnd = documentRef.createRange();
        beforeEnd.selectNodeContents(element);
        beforeEnd.setEnd(range.endContainer, range.endOffset);
        return { start: beforeStart.toString().length, end: beforeEnd.toString().length };
    }

    function rememberCaretPosition(element) {
        const selection = windowRef.getSelection();
        const offsets = selection?.rangeCount ? getRangeOffsets(element, selection.getRangeAt(0)) : null;
        if (offsets) savedCaretPositions.set(element, offsets);
    }

    function setContenteditableCaret(element, offset) {
        const textNode = element.firstChild || element.appendChild(documentRef.createTextNode(''));
        const range = documentRef.createRange();
        range.setStart(textNode, Math.min(offset, textNode.textContent.length));
        range.collapse(true);
        const selection = windowRef.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function captureContenteditableInsertion(element) {
        const text = element.textContent || '';
        const selection = windowRef.getSelection();
        const activeOffsets = selection?.rangeCount ? getRangeOffsets(element, selection.getRangeAt(0)) : null;
        const savedOffsets = savedCaretPositions.get(element);
        const offsets = activeOffsets || savedOffsets || { start: text.length, end: text.length };
        const start = Math.max(0, Math.min(text.length, offsets.start));
        const end = Math.max(start, Math.min(text.length, offsets.end));
        const prefix = text.slice(0, start);
        const suffix = text.slice(end);
        const followEnd = end === text.length;
        return transcript => {
            element.textContent = `${prefix}${transcript}${suffix}`;
            const caretOffset = prefix.length + transcript.length;
            element.focus({ preventScroll: true });
            setContenteditableCaret(element, caretOffset);
            savedCaretPositions.set(element, { start: caretOffset, end: caretOffset });
            if (followEnd) windowRef.requestAnimationFrame(() => { element.scrollTop = element.scrollHeight; });
            element.dispatchEvent(new Event('input', { bubbles: true }));
        };
    }

    function togglePanelDictation(element, targetId, language, buttonEl) {
        if (!element || !isDictationSupported() || buttonEl?.disabled) return;
        const writeTranscript = captureContenteditableInsertion(element);
        toggleDictation({ targetId, language, onTranscript: writeTranscript });
    }

    function getAutoLanguageLabel() {
        return getPanelTexts().autoLabel || 'Detect';
    }

    function syncCompactLanguageLabels() {
        const detected = getDetectedSourceLanguage();
        const sourceCode = sourceLangSelect.value || 'auto';
        const detectedLabel = detected && detected !== 'auto' ? getLanguageLabel(detected) : '';
        const sourceLabel = sourceCode === 'auto'
            ? `${getAutoLanguageLabel()} (${detectedLabel || '…'})`
            : getLanguageLabel(sourceCode);
        if (sourceAutoOption) {
            sourceAutoOption.textContent = sourceLabel;
            sourceAutoOption.label = sourceLabel;
        }
        const sourceTrigger = documentRef.getElementById('sourceLangTrigger');
        if (sourceTrigger) sourceTrigger.setAttribute('aria-label', sourceLabel);
        if (panelSourceLanguageLabel) panelSourceLanguageLabel.textContent = sourceLabel;
        const targetCode = targetLangSelect.value || getCurrentResolvedTargetLanguage();
        const targetLabel = getLanguageLabel(targetCode);
        if (panelTargetLanguageLabel) panelTargetLanguageLabel.textContent = targetLabel;
        const targetTrigger = documentRef.getElementById('targetLangTrigger');
        if (targetTrigger) targetTrigger.setAttribute('aria-label', targetLabel);
    }

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
        cancelTranslation();
        retry.hidden = true;
        setCurrentTranslatedText('');
        setPanelLoading(true, loadingMode);
        cancelTranslation = translateText(text, sourceLang, targetLang, (translation, pos, resolvedTargetLang, error) => {
            if (requestId !== panelTranslateRequestId) return;
            setPanelLoading(false, loadingMode);
            if (error) {
                translationText.textContent = error.message;
                translatedTextIsManual = false;
                retry.hidden = false;
                return;
            }
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
        const dragLabelEl = translationBox.querySelector('#dragHandle [data-utst-drag-label]');
        if (dragLabelEl) dragLabelEl.textContent = dragHandleLabel;
        syncCompactLanguageLabels();
    }

    function updateNoTextErrorMessage(previousErrors) {
        if (translationText && previousErrors && translationText.textContent === previousErrors.noText) {
            translationText.textContent = getErrors().noText;
        }
    }

    function openTranslationPanelForText(selectedText, selectionPosition) {
        restorePopupOverflow();
        stopSpeaking();
        stopDictation();
        sourceLangSelect.value = 'auto';
        setDetectedSourceLanguage('auto');
        translatedTextIsManual = false;
        if (panelSourceText) panelSourceText.textContent = (selectedText || '').trim();
        syncCompactLanguageLabels();

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
            cancelTranslation();
            panelTranslateRequestId++;
            setPanelLoading(false);
            translationText.textContent = getErrors().noText;
            translatedTextIsManual = false;
            translationBox.style.display = 'block';
            setCurrentSelectedText('');
            setCurrentTranslatedText('');
            retry.hidden = true;
            placeBoxAtSelection({ x: scrollX + 10, y: scrollY + 10 });
            translationBox.style.opacity = '1';
            translationBox.style.transform = 'translateY(0)';
            return;
        }

        setCurrentSelectedText(text);

        const savedTargetLang = getSavedTargetLanguage();
        const targetLangForSession = ensureSelectValue(targetLangSelect, savedTargetLang);
        ensureSelectValue(defaultTranslateLangSelect, savedTargetLang);
        syncCompactLanguageLabels();

        const fallbackPosition = selectionPosition && Number.isFinite(selectionPosition.x) && Number.isFinite(selectionPosition.y)
            ? selectionPosition
            : { x: 0, y: 0 };

        translationText.textContent = '';
        translatedTextIsManual = false;
        translationBox.style.display = 'block';
        placeBoxAtSelection(fallbackPosition);
        translationBox.style.opacity = '1';
        translationBox.style.transform = 'translateY(0)';

        runPanelTranslation(text, 'auto', targetLangForSession, (translation, pos, resolvedTargetLang) => {
            setCurrentTranslatedText(translation);
            translationText.textContent = translation;
            translatedTextIsManual = false;
            setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
            syncCompactLanguageLabels();
            placeBoxAtSelection(pos || fallbackPosition);
            hideSelectionBubble();
        }, fallbackPosition, 'translate');
    }

    function handleLanguageChange() {
        stopSpeaking();
        stopDictation();
        const targetVal = targetLangSelect.value;
        setCurrentResolvedTargetLanguage(targetVal === 'navigator' ? getBrowserLanguage() : targetVal);

        const sourceVal = sourceLangSelect.value;
        if (sourceVal !== 'auto') {
            setDetectedSourceLanguage(sourceVal);
        }
        syncCompactLanguageLabels();

        if (getCurrentSelectedText()) {
            runPanelTranslation(getCurrentSelectedText(), sourceVal, targetVal, (translation, pos, resolvedTargetLang) => {
                setCurrentTranslatedText(translation);
                translationText.textContent = translation;
                translatedTextIsManual = false;
                setCurrentResolvedTargetLanguage(resolvedTargetLang || getCurrentResolvedTargetLanguage());
                syncCompactLanguageLabels();
            }, { x: parseFloat(translationBox.style.left), y: parseFloat(translationBox.style.top) }, 'language');
        }
    }

    function bindPanelActionControls() {
        translationBox.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.stopPropagation(); closeTranslationBoxFromOutside(); }
        });
        sourceLangSelect.addEventListener('change', () => {
            promoteManualTranslationToSource(sourceLangSelect.value);
            handleLanguageChange();
        });
        targetLangSelect.addEventListener('change', () => {
            ensureSelectValue(targetLangSelect, targetLangSelect.value);
            promoteManualTranslationToSource();
            handleLanguageChange();
        });

        [panelSourceText, translationText].filter(Boolean).forEach(element => {
            element.addEventListener('focus', () => {
                lastPanelEditable = element;
                rememberCaretPosition(element);
            });
            element.addEventListener('pointerup', () => rememberCaretPosition(element));
            element.addEventListener('keyup', () => rememberCaretPosition(element));
        });
        documentRef.addEventListener('selectionchange', () => {
            const selection = windowRef.getSelection();
            if (!selection?.rangeCount) return;
            [panelSourceText, translationText].filter(Boolean).forEach(element => {
                if (!isRangeInElement(selection.getRangeAt(0), element)) return;
                lastPanelEditable = element;
                rememberCaretPosition(element);
            });
        });

        if (panelSourceText) panelSourceText.addEventListener('input', () => {
            const editedText = panelSourceText.textContent.trim();
            setCurrentSelectedText(editedText);
            windowRef.clearTimeout(sourceEditTimer);
            if (!editedText) {
                cancelTranslation();
                panelTranslateRequestId++;
                setCurrentTranslatedText('');
                translationText.textContent = '';
                sourceLangSelect.value = 'auto';
                setDetectedSourceLanguage('auto');
                translatedTextIsManual = false;
                syncCompactLanguageLabels();
                return;
            }
            sourceEditTimer = windowRef.setTimeout(handleLanguageChange, 360);
        });

        translationText.addEventListener('input', () => {
            setCurrentTranslatedText(translationText.textContent.trim());
            translatedTextIsManual = true;
        });

        function promoteManualTranslationToSource(sourceLanguage = null) {
            if (!translatedTextIsManual) return false;
            const manualText = translationText.textContent.trim();
            if (!manualText) return false;
            const nextSourceLanguage = sourceLanguage || getCurrentResolvedTargetLanguage() || getBrowserLanguage();
            ensureSelectValue(sourceLangSelect, nextSourceLanguage);
            setDetectedSourceLanguage(nextSourceLanguage);
            setCurrentSelectedText(manualText);
            setCurrentTranslatedText('');
            if (panelSourceText) panelSourceText.textContent = manualText;
            translationText.textContent = '';
            translatedTextIsManual = false;
            syncCompactLanguageLabels();
            return true;
        }

        let panelSwapRotation = 0;
        const panelSwapBtn = ui.panelSwap;
        if (panelSwapBtn) {
            panelSwapBtn.addEventListener('click', () => {
                const src = sourceLangSelect.value;
                const tgt = targetLangSelect.value;
                const detected = getDetectedSourceLanguage();
                const actualSource = src === 'auto'
                    ? ((detected && detected !== 'auto') ? detected : getBrowserLanguage())
                    : src;
                const actualTarget = tgt === 'navigator' ? getCurrentResolvedTargetLanguage() : tgt;
                const originalText = getCurrentSelectedText();
                const translatedTextValue = getCurrentTranslatedText();

                ensureSelectValue(sourceLangSelect, actualTarget);
                ensureSelectValue(targetLangSelect, actualSource);
                setDetectedSourceLanguage(sourceLangSelect.value);

                if (translatedTextValue) {
                    setCurrentSelectedText(translatedTextValue);
                    if (panelSourceText) panelSourceText.textContent = translatedTextValue;
                    setCurrentTranslatedText(originalText);
                    translationText.textContent = originalText;
                }
                translatedTextIsManual = false;

                panelSwapRotation += 180;
                panelSwapBtn.querySelector('svg').style.setProperty('--utst-panel-swap-rot', `${panelSwapRotation}deg`);
                handleLanguageChange();
            });
        }

        function setSpeakMenuOpen(open) {
            if (!speakTooltip || !speakControl) return;
            speakControl.classList.toggle('utst-speak-menu-open', open);
            speakButton.setAttribute('aria-expanded', String(open));
        }

        speakButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const { playing, speakerId } = getSpeechState();
            const isCompactPopup = windowRef.matchMedia?.('(pointer: coarse), (max-width: 640px)').matches;
            if (isCompactPopup) {
                if (playing && speakerId === 'panel-translated') {
                    stopSpeaking();
                    return;
                }
                if (!getCurrentTranslatedText()) return;
                speak(
                    getCurrentTranslatedText(),
                    resolveTargetSpeechLanguage(targetLangSelect.value, getCurrentResolvedTargetLanguage()),
                    'panel-translated'
                );
                return;
            }
            if (playing && (speakerId === 'panel-original' || speakerId === 'panel-translated')) {
                setSpeakMenuOpen(false);
                stopSpeaking();
                return;
            }
            setSpeakMenuOpen(!speakControl?.classList.contains('utst-speak-menu-open'));
        });

        speakTranslated.addEventListener('click', (e) => {
            e.stopPropagation();
            setSpeakMenuOpen(false);
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
            setSpeakMenuOpen(false);
            if (getCurrentSelectedText()) {
                speak(
                    getCurrentSelectedText(),
                    resolveSourceSpeechLanguage(sourceLangSelect ? sourceLangSelect.value : 'auto'),
                    'panel-original'
                );
            }
        });

        translationBox.addEventListener('pointerdown', event => {
            if (!eventPathContains(event, speakControl)) setSpeakMenuOpen(false);
        });

        if (panelSourceSpeak) panelSourceSpeak.addEventListener('click', (event) => {
            event.stopPropagation();
            const { playing, speakerId } = getSpeechState();
            if (playing && speakerId === 'panel-original') {
                stopSpeaking();
                return;
            }
            if (getCurrentSelectedText()) {
                speak(getCurrentSelectedText(), resolveSourceSpeechLanguage(sourceLangSelect.value), 'panel-original');
            }
        });

        if (panelSourceDictate) panelSourceDictate.addEventListener('click', () => {
            togglePanelDictation(
                panelSourceText,
                'panel-source',
                resolveSourceDictationLanguage(sourceLangSelect.value, getDetectedSourceLanguage()),
                panelSourceDictate
            );
        });

        if (panelDictate) panelDictate.addEventListener('click', () => {
            const target = lastPanelEditable === panelSourceText ? panelSourceText : translationText;
            const isSource = target === panelSourceText;
            togglePanelDictation(
                target,
                isSource ? 'panel-source' : 'panel-target',
                isSource
                    ? resolveSourceDictationLanguage(sourceLangSelect.value, getDetectedSourceLanguage())
                    : resolveTargetSpeechLanguage(targetLangSelect.value, getCurrentResolvedTargetLanguage()),
                panelDictate
            );
        });

        if (panelSourceCopy) panelSourceCopy.addEventListener('click', async () => {
            if (!getCurrentSelectedText()) return;
            const copied = await writeClipboardText(getCurrentSelectedText());
            if (!copied) return;
            showCopyFeedback(panelSourceCopy);
        });

        copyButton.addEventListener('click', async () => {
            if (getCurrentTranslatedText()) {
                const copied = await writeClipboardText(getCurrentTranslatedText());
                if (!copied) { translationText.focus(); return; }
                showCopyFeedback(copyButton);
            }
        });
    }

    function bindPanelNavigationControls() {
        const closeSettingsPanel = () => {
            closeOpenMenus();
            if (translatorPanel) translatorPanel.style.display = 'block';
            if (settingsPanel) settingsPanel.style.display = 'none';
            if (settingsHeader) settingsHeader.style.display = 'none';
            settingsButton.setAttribute('aria-expanded', 'false');
            translationBox.classList.remove('utst-settings-open');
        };

        closeButton.addEventListener('click', () => {
            cancelTranslation();
            panelTranslateRequestId++;
            setPanelLoading(false);
            translationBox.style.display = 'none';
            translationBox.style.opacity = '0';
            translationBox.style.transform = 'translateY(10px)';
            sourceLangSelect.value = 'auto';
            setDetectedSourceLanguage('auto');
            stopSpeaking();
            stopDictation();

            if (translatorPanel) translatorPanel.style.display = 'block';
            if (settingsPanel) settingsPanel.style.display = 'none';
            if (settingsHeader) settingsHeader.style.display = 'none';
            settingsButton.setAttribute('aria-expanded', 'false');
            translationBox.classList.remove('utst-settings-open');
            restorePopupOverflow();
            scheduleSelectionBubbleUpdate(0);
        });

        settingsButton.addEventListener('click', () => {
            const isOpen = settingsPanel && settingsPanel.style.display === 'block';
            if (isOpen) {
                closeSettingsPanel();
                return;
            }
            closeOpenMenus();
            if (translatorPanel) translatorPanel.style.display = 'none';
            if (settingsPanel) settingsPanel.style.display = 'block';
            if (settingsHeaderTitle) settingsHeaderTitle.textContent = getSettingsTitle();
            if (settingsHeader) settingsHeader.style.display = 'flex';
            settingsButton.setAttribute('aria-expanded', 'true');
            translationBox.classList.add('utst-settings-open');
        });

        backButton.addEventListener('click', closeSettingsPanel);
        settingsHeaderTitle?.addEventListener('click', closeSettingsPanel);
    }

    function closeTranslationBoxFromOutside() {
        cancelTranslation();
        panelTranslateRequestId++;
        setPanelLoading(false);
        translationBox.style.display = 'none';
        translationBox.style.opacity = '0';
        translationBox.style.transform = 'translateY(10px)';
        sourceLangSelect.value = 'auto';
        setDetectedSourceLanguage('auto');
        if (settingsHeader) settingsHeader.style.display = 'none';
        settingsButton.setAttribute('aria-expanded', 'false');
        translationBox.classList.remove('utst-settings-open');
        restorePopupOverflow();
        stopSpeaking();
        stopDictation();
        scheduleSelectionBubbleUpdate(0);
    }

    function bindPanelOutsideControls(isClickInProtectedOverlay) {
        function handleOutsideMouseDown(event) {
            if (isClickInProtectedOverlay(event) || eventPathContains(event, translationBox)) return;
            if (translationBox.style.display === 'block') closeTranslationBoxFromOutside();
        }

        documentRef.addEventListener('pointerdown', handleOutsideMouseDown);
        documentRef.addEventListener('keydown', event => {
            if (event.key === 'Escape' && translationBox.style.display === 'block' && !isClickInProtectedOverlay(event)) {
                closeTranslationBoxFromOutside();
            }
        });

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
