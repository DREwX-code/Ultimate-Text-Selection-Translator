import { userscriptApi } from './userscript-api.js';
import { normalizeInitialToolLanguage } from './utils.js';

export const TOOL_LANGUAGE_KEY = 'defaultToolLang';
export const DEFAULT_TARGET_LANGUAGE_KEY = 'defaultTranslateLang';
export const BUBBLE_ENABLED_KEY = 'selectionBubbleEnabled';
export const BUBBLE_ENABLED_RECOVERY_KEY = 'selectionBubbleEnabledRecovery';
export const BUBBLE_BLACKLIST_KEY = 'selectionBubbleBlacklist';
export const PANEL_THEME_KEY = 'panelTheme';
export const SHORTCUT_KEY = 'selectionShortcut';
export const SIDE_PANEL_WIDTH_KEY = 'sidePanelWidth';

export const DEFAULT_TOOL_LANGUAGE = 'browser';
export const DEFAULT_PANEL_THEME = 'blue';
export const DEFAULT_SELECTION_BUBBLE_ENABLED = true;
export const DEFAULT_SIDE_PANEL_WIDTH = 440;
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
    const storedPreference = userscriptApi.getValue(TOOL_LANGUAGE_KEY, DEFAULT_TOOL_LANGUAGE);
    const normalizedPreference = normalizeToolLanguagePreference(storedPreference, supportedLanguages);
    if (normalizedPreference !== storedPreference) {
        userscriptApi.setValue(TOOL_LANGUAGE_KEY, normalizedPreference);
    }
    return normalizedPreference;
}

export function saveToolLanguagePreference(preference) {
    userscriptApi.setValue(TOOL_LANGUAGE_KEY, preference);
}

export function loadSelectionBubbleEnabled() {
    // Earlier builds exposed a global "hide" entry directly in the bubble.
    // Restore that stale hidden state once after the selection UI redesign so
    // the translator remains discoverable; later explicit user choices persist.
    if (userscriptApi.getValue(BUBBLE_ENABLED_RECOVERY_KEY, 0) < 1) {
        userscriptApi.setValue(BUBBLE_ENABLED_RECOVERY_KEY, 1);
        userscriptApi.setValue(BUBBLE_ENABLED_KEY, true);
        return true;
    }
    return userscriptApi.getValue(BUBBLE_ENABLED_KEY, DEFAULT_SELECTION_BUBBLE_ENABLED) !== false;
}

export function saveSelectionBubbleEnabled(enabled) {
    userscriptApi.setValue(BUBBLE_ENABLED_KEY, enabled);
}

export function normalizePanelTheme(value) {
    return value === 'dark' || value === 'light' ? value : DEFAULT_PANEL_THEME;
}

export function loadPanelTheme() {
    return normalizePanelTheme(userscriptApi.getValue(PANEL_THEME_KEY, DEFAULT_PANEL_THEME));
}

export function savePanelTheme(theme) {
    userscriptApi.setValue(PANEL_THEME_KEY, theme);
}

export function normalizeSidePanelWidth(value) {
    const width = Number(value);
    if (!Number.isFinite(width)) return DEFAULT_SIDE_PANEL_WIDTH;
    return Math.round(Math.min(760, Math.max(340, width)));
}

export function loadSidePanelWidth() {
    const stored = userscriptApi.getValue(SIDE_PANEL_WIDTH_KEY, DEFAULT_SIDE_PANEL_WIDTH);
    const normalized = normalizeSidePanelWidth(stored);
    if (normalized !== stored) userscriptApi.setValue(SIDE_PANEL_WIDTH_KEY, normalized);
    return normalized;
}

export function saveSidePanelWidth(width) {
    const normalized = normalizeSidePanelWidth(width);
    userscriptApi.setValue(SIDE_PANEL_WIDTH_KEY, normalized);
    return normalized;
}

export function cloneDefaultShortcut() {
    return { ...DEFAULT_SHORTCUT };
}

export function loadShortcutSetting(normalizeShortcutCandidate) {
    const saved = userscriptApi.getValue(SHORTCUT_KEY, null);
    const normalized = normalizeShortcutCandidate(saved);
    if (!saved || JSON.stringify(saved) !== JSON.stringify(normalized)) {
        userscriptApi.setValue(SHORTCUT_KEY, normalized);
    }
    return normalized;
}

export function saveNormalizedShortcutSetting(shortcut) {
    userscriptApi.setValue(SHORTCUT_KEY, shortcut);
}

export function saveShortcutSetting(shortcut, normalizeShortcutCandidate) {
    const normalized = normalizeShortcutCandidate(shortcut);
    userscriptApi.setValue(SHORTCUT_KEY, normalized);
    return normalized;
}

export function loadBubbleBlacklist(normalizeHostname) {
    const stored = userscriptApi.getValue(BUBBLE_BLACKLIST_KEY, []);
    const list = Array.isArray(stored)
        ? stored
        : typeof stored === 'string'
            ? stored.split(',').map(value => value.trim())
            : [];
    const normalized = [...new Set(list.map(normalizeHostname).filter(Boolean))];
    userscriptApi.setValue(BUBBLE_BLACKLIST_KEY, normalized);
    return normalized;
}

export function saveBubbleBlacklist(blacklist) {
    userscriptApi.setValue(BUBBLE_BLACKLIST_KEY, blacklist);
}

export function loadDefaultTargetLanguage(defaultLanguage, isValidLanguage) {
    const saved = userscriptApi.getValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
    if (!isValidLanguage(saved)) {
        userscriptApi.setValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
        return defaultLanguage;
    }
    return saved;
}

export function readDefaultTargetLanguage(defaultLanguage) {
    return userscriptApi.getValue(DEFAULT_TARGET_LANGUAGE_KEY, defaultLanguage);
}

export function saveDefaultTargetLanguage(language, defaultLanguage, isValidLanguage) {
    const valueToPersist = isValidLanguage(language) ? language : defaultLanguage;
    userscriptApi.setValue(DEFAULT_TARGET_LANGUAGE_KEY, valueToPersist);
    return valueToPersist;
}

export function initializeStorage() {
    return userscriptApi.initialize([TOOL_LANGUAGE_KEY, DEFAULT_TARGET_LANGUAGE_KEY, BUBBLE_ENABLED_KEY,
        BUBBLE_ENABLED_RECOVERY_KEY, BUBBLE_BLACKLIST_KEY, PANEL_THEME_KEY, SHORTCUT_KEY, SIDE_PANEL_WIDTH_KEY]);
}
