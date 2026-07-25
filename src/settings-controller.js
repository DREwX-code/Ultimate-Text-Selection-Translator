import {
    normalizeToolLanguagePreference,
    readDefaultTargetLanguage,
    saveToolLanguagePreference
} from './storage.js';

export function createSettingsController({
    ui,
    languageApi,
    runtimeState,
    speechApi,
    panelApi,
    fullscreenApi,
    themeApi,
    shortcutApi,
    languagePanelsApi,
    selectionApi
}) {
    const {
        defaultTranslateLangSelect,
        toolLanguageSelect,
        targetLangSelect,
        defaultTranslateLangLabel,
        toolLanguageLabel,
        panelThemeLabel,
        bubbleToggleLabel,
        bubbleBlacklistLabel,
        bubbleBlacklistAddButton,
        settingsButton,
        settingsHeaderTitle
    } = ui;
    const {
        getBrowserLanguage,
        getDefaultTargetLanguage,
        getLanguageNames,
        getEnglishLanguageNames,
        getErrors,
        getLocalizedRuntimeState,
        getSupportedUiLanguages,
        getSavedTargetLanguage,
        persistDefaultTargetLanguage,
        getSettingsTextState,
        buildToolLanguageOptionsHtml,
        buildTargetLanguageOptions,
        ensureSelectValue
    } = languageApi;
    const {
        getToolLanguagePreference,
        setToolLanguagePreference,
        setLocalizedRuntimeStateValues,
        setCurrentResolvedTargetLanguage
    } = runtimeState;
    const { stopSpeaking } = speechApi;
    const {
        handleLanguageChange,
        updateTranslatorTexts,
        updateNoTextErrorMessage
    } = panelApi;
    const {
        updateFullscreenTexts,
        refreshFullscreenLanguageSelects
    } = fullscreenApi;
    const {
        refreshThemeOptionsLabels,
        bindThemeControls,
        applyCurrentPanelTheme
    } = themeApi;
    const {
        updateShortcutSettingsUi,
        bindShortcutControls,
        refreshKeyboardLayoutMap
    } = shortcutApi;
    const { refreshInlineLanguagePlaceholders } = languagePanelsApi;
    const {
        syncSelectionBubbleSettingsUi,
        scheduleSelectionBubbleUpdate,
        bindSelectionBubbleControls
    } = selectionApi;

    function setLocalizedRuntimeState(normalizedSelection) {
        setToolLanguagePreference(normalizedSelection);
        const localizedState = getLocalizedRuntimeState(normalizedSelection);
        setLocalizedRuntimeStateValues(localizedState);
    }

    function getCurrentSettingsLabels() {
        const langNames = getLanguageNames();
        const englishLanguageNames = getEnglishLanguageNames();
        return {
            theme: langNames.settingsThemeLabel || englishLanguageNames.settingsThemeLabel || 'Theme:',
            bubble: langNames.settingsBubbleLabel || englishLanguageNames.settingsBubbleLabel || 'Selection Bubble',
            blacklist: langNames.settingsBlacklistLabel || englishLanguageNames.settingsBlacklistLabel || 'Blacklist',
            blacklistAdd: langNames.settingsBlacklistAdd || englishLanguageNames.settingsBlacklistAdd || 'Add'
        };
    }

    function updateSettingsTexts() {
        const labels = getCurrentSettingsLabels();
        const {
            settingsTitle,
            settingsDefaultLabel,
            settingsToolLabel
        } = getSettingsTextState();
        if (settingsHeaderTitle) settingsHeaderTitle.textContent = settingsTitle;
        if (defaultTranslateLangLabel) defaultTranslateLangLabel.textContent = settingsDefaultLabel;
        if (toolLanguageLabel) toolLanguageLabel.textContent = settingsToolLabel;
        if (panelThemeLabel) panelThemeLabel.textContent = labels.theme;
        if (bubbleToggleLabel) bubbleToggleLabel.textContent = labels.bubble;
        if (bubbleBlacklistLabel) bubbleBlacklistLabel.textContent = labels.blacklist;
        if (bubbleBlacklistAddButton) bubbleBlacklistAddButton.textContent = labels.blacklistAdd;
        if (settingsButton) settingsButton.title = settingsTitle;
    }

    function refreshToolLanguageSelect(normalizedSelection) {
        if (toolLanguageSelect) {
            toolLanguageSelect.innerHTML = buildToolLanguageOptionsHtml();
            toolLanguageSelect.value = normalizedSelection;
        }
    }

    function refreshTargetLanguageSelects() {
        const defaultTargetLang = getDefaultTargetLanguage();
        const currentTargetValue = targetLangSelect.value;
        const savedDefaultValue = readDefaultTargetLanguage(defaultTargetLang);
        const refreshedTargetOptions = buildTargetLanguageOptions(true);
        targetLangSelect.innerHTML = refreshedTargetOptions;
        ensureSelectValue(targetLangSelect, currentTargetValue);

        defaultTranslateLangSelect.innerHTML = refreshedTargetOptions;
        ensureSelectValue(defaultTranslateLangSelect, savedDefaultValue);
    }

    function applyToolLanguage(preference, { persist = false } = {}) {
        const normalizedSelection = normalizeToolLanguagePreference(preference, getSupportedUiLanguages());
        if (persist) saveToolLanguagePreference(normalizedSelection);

        const previousErrors = getErrors();
        setLocalizedRuntimeState(normalizedSelection);
        updateSettingsTexts();
        updateTranslatorTexts();
        updateFullscreenTexts();
        refreshFullscreenLanguageSelects();
        refreshToolLanguageSelect(normalizedSelection);
        refreshThemeOptionsLabels();
        updateShortcutSettingsUi();
        refreshInlineLanguagePlaceholders();
        updateNoTextErrorMessage(previousErrors);
        syncSelectionBubbleSettingsUi();
        scheduleSelectionBubbleUpdate(0);
        refreshTargetLanguageSelects();
    }

    function initializeSettingsControls() {
        const initialTargetLang = getSavedTargetLanguage();
        ensureSelectValue(targetLangSelect, initialTargetLang);
        ensureSelectValue(defaultTranslateLangSelect, initialTargetLang);
        setCurrentResolvedTargetLanguage(initialTargetLang === 'navigator' ? getBrowserLanguage() : initialTargetLang);
        if (toolLanguageSelect) {
            toolLanguageSelect.value = getToolLanguagePreference();
        }

        defaultTranslateLangSelect.addEventListener('change', () => {
            stopSpeaking();
            const persisted = persistDefaultTargetLanguage(defaultTranslateLangSelect.value);
            ensureSelectValue(targetLangSelect, persisted);
            setCurrentResolvedTargetLanguage(persisted === 'navigator' ? getBrowserLanguage() : persisted);
            handleLanguageChange();
        });

        [defaultTranslateLangLabel, toolLanguageLabel].forEach((labelEl) => {
            if (!labelEl) return;
            labelEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
            labelEl.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });

        if (toolLanguageSelect) {
            toolLanguageSelect.addEventListener('change', () => {
                const selected = toolLanguageSelect.value || 'browser';
                const supportedUiLanguages = getSupportedUiLanguages();
                const normalizedSelection = (selected === 'browser' || supportedUiLanguages.includes(selected)) ? selected : 'browser';
                applyToolLanguage(normalizedSelection, { persist: true });
            });
        }

        bindThemeControls();

        bindShortcutControls();

        bindSelectionBubbleControls();

        applyCurrentPanelTheme();
        applyToolLanguage(getToolLanguagePreference());
        syncSelectionBubbleSettingsUi();
        refreshKeyboardLayoutMap();
        scheduleSelectionBubbleUpdate(0);
    }

    return {
        applyToolLanguage,
        initializeSettingsControls,
        updateSettingsTexts
    };
}
