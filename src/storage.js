import { normalizeInitialToolLanguage } from './utils.js';

export const TOOL_LANGUAGE_KEY = 'defaultToolLang';
export const DEFAULT_TARGET_LANGUAGE_KEY = 'defaultTranslateLang';
export const BUBBLE_ENABLED_KEY = 'selectionBubbleEnabled';
export const BUBBLE_BLACKLIST_KEY = 'selectionBubbleBlacklist';
export const PANEL_THEME_KEY = 'panelTheme';
export const SHORTCUT_KEY = 'selectionShortcut';

export const DEFAULT_TOOL_LANGUAGE = 'browser';
export const DEFAULT_PANEL_THEME = 'blue';
export const DEFAULT_SELECTION_BUBBLE_ENABLED = true;
export const DEFAULT_SHORTCUT = Object.freeze({
    ctrl: true,
    alt: false,
    shift: false,
    meta: false,
    key: 'l',
    code: 'KeyL',
    displayKey: 'L'
});

export function normalizeToolLanguagePreference(preference, supportedLanguages) {
    return normalizeInitialToolLanguage(preference, supportedLanguages);
}

export function loadToolLanguagePreference(supportedLanguages) {
    const storedPreference = GM_getValue(TOOL_LANGUAGE_KEY, DEFAULT_TOOL_LANGUAGE);
    const normalizedPreference = normalizeToolLanguagePreference(storedPreference, supportedLanguages);
    if (normalizedPreference !== storedPreference) {
        GM_setValue(TOOL_LANGUAGE_KEY, normalizedPreference);
    }
    return normalizedPreference;
}

export function saveToolLanguagePreference(preference) {
    GM_setValue(TOOL_LANGUAGE_KEY, preference);
}

export function loadSelectionBubbleEnabled() {
    return GM_getValue(BUBBLE_ENABLED_KEY, DEFAULT_SELECTION_BUBBLE_ENABLED) !== false;
}

export function saveSelectionBubbleEnabled(enabled) {
    GM_setValue(BUBBLE_ENABLED_KEY, enabled);
}

export function normalizePanelTheme(value) {
    return value === 'dark' || value === 'light' ? value : DEFAULT_PANEL_THEME;
}

export function loadPanelTheme() {
    return normalizePanelTheme(GM_getValue(PANEL_THEME_KEY, DEFAULT_PANEL_THEME));
}

export function savePanelTheme(theme) {
    GM_setValue(PANEL_THEME_KEY, theme);
}

export function cloneDefaultShortcut() {
    return { ...DEFAULT_SHORTCUT };
}

export function loadShortcutSetting(normalizeShortcutCandidate) {
    const saved = GM_getValue(SHORTCUT_KEY, null);
    const normalized = normalizeShortcutCandidate(saved);
    if (!saved || JSON.stringify(saved) !== JSON.stringify(normalized)) {
        GM_setValue(SHORTCUT_KEY, normalized);
    }
    return normalized;
}

export function saveNormalizedShortcutSetting(shortcut) {
    GM_setValue(SHORTCUT_KEY, shortcut);
}

export function saveShortcutSetting(shortcut, normalizeShortcutCandidate) {
    const normalized = normalizeShortcutCandidate(shortcut);
    GM_setValue(SHORTCUT_KEY, normalized);
    return normalized;
}

export function loadBubbleBlacklist(normalizeHostname) {
    const stored = GM_getValue(BUBBLE_BLACKLIST_KEY, []);
    const list = Array.isArray(stored)
        ? stored
        : typeof stored === 'string'
            ? stored.split(',').map(value => value.trim())
            : [];
    const normalized = [...new Set(list.map(normalizeHostname).filter(Boolean))];
    GM_setValue(BUBBLE_BLACKLIST_KEY, normalized);
    return normalized;
}

export function saveBubbleBlacklist(blacklist) {
    GM_setValue(BUBBLE_BLACKLIST_KEY, blacklist);
}

export function loadDefaultTargetLanguage(defaultLanguage, isValidLanguage) {
    const saved = GM_getValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
    if (!isValidLanguage(saved)) {
        GM_setValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
        return defaultLanguage;
    }
    return saved;
}

export function readDefaultTargetLanguage(defaultLanguage) {
    return GM_getValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
}

export function saveDefaultTargetLanguage(language, defaultLanguage, isValidLanguage) {
    const valueToPersist = isValidLanguage(language) ? language : defaultLanguage;
    GM_setValue(DEFAULT_TARGET_LANGUAGE_KEY, valueToPersist);
    return valueToPersist;
}
