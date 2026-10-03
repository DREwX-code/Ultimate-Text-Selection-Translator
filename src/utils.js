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

export function normalizeBrowserLanguage(language = 'en') {
    const tag = language.toLowerCase().replace(/_/g, '-');
    if (tag.startsWith('zh')) return /(?:tw|hk|mo|hant)/.test(tag) ? 'zh-TW' : 'zh-CN';
    const base = tag.split('-')[0];
    return ({ nb: 'no', nn: 'no', fil: 'tl', iw: 'he' })[base] || base;
}
