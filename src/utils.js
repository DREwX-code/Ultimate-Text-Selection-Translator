export function getSupportedUiLanguages(library, availableLanguageNames) {
    return Array.isArray(library.supportedUiLanguages) && library.supportedUiLanguages.length
        ? library.supportedUiLanguages
        : Object.keys(availableLanguageNames);
}

export function normalizeInitialToolLanguage(preference, supportedLanguages) {
    return preference === 'browser' || supportedLanguages.includes(preference)
        ? preference
        : 'browser';
}

export function getLocalizedValue(localizedValues, fallbackValues, key) {
    return localizedValues[key] || fallbackValues[key];
}

export function getLanguageName(localizedLanguageNames, code, fallback) {
    return localizedLanguageNames[code] || fallback;
}
