import {
    formatLayoutMapKey,
    getLetterOrDigitCodeLabel,
    getShortcutCodeFromLegacyKey,
    getSpecialCodeLabel,
    hasShortcutModifier,
    isModifierShortcutCode,
    isModifierShortcutKey
} from './utils.js';

export function createShortcutController({
    documentRef,
    navigatorRef,
    shortcutCaptureLabel,
    shortcutCaptureButton,
    shortcutResetButton,
    shortcutCaptureHelp,
    cloneDefaultShortcut,
    loadShortcutSetting,
    persistShortcutSetting,
    saveNormalizedShortcutSetting,
    getLanguageState,
    getUiLanguage,
    onShortcutTriggered
}) {
    let shortcutCaptureActive = false;
    let keyboardLayoutMap = null;
    let currentShortcut;

    function getKeyboardLayoutLabel(code) {
        if (!keyboardLayoutMap || !code || typeof keyboardLayoutMap.get !== 'function') return '';
        return formatLayoutMapKey(keyboardLayoutMap.get(code));
    }

    function getDisplayKeyFromCode(code, fallbackKey = '') {
        const codeText = String(code || '');
        const layoutLabel = getKeyboardLayoutLabel(codeText);
        if (layoutLabel) return layoutLabel;
        if (/^Key[A-Z]$/.test(codeText)) return getLetterOrDigitCodeLabel(codeText, fallbackKey, 3);
        if (/^Digit[0-9]$/.test(codeText)) return getLetterOrDigitCodeLabel(codeText, fallbackKey, 5);
        if (/^Numpad[0-9]$/.test(codeText)) return `Num ${codeText.slice(6)}`;
        if (/^F([1-9]|1[0-9]|2[0-4])$/.test(codeText)) return codeText;

        const specialLabel = getSpecialCodeLabel(codeText);
        if (specialLabel) return specialLabel;

        const keyText = String(fallbackKey || '');
        return keyText.length === 1 ? keyText.toUpperCase() : keyText;
    }

    function normalizeShortcutCandidate(value) {
        if (!value || typeof value !== 'object') return cloneDefaultShortcut();
        const legacyKey = String(value.key || '').toLowerCase();
        const code = String(value.code || getShortcutCodeFromLegacyKey(legacyKey));
        const displayKey = getDisplayKeyFromCode(code, legacyKey);
        const shortcut = {
            ctrl: !!value.ctrl,
            alt: !!value.alt,
            shift: !!value.shift,
            meta: !!value.meta,
            key: legacyKey,
            code,
            displayKey
        };
        if (!shortcut.code || !hasShortcutModifier(shortcut) || isModifierShortcutCode(shortcut.code) || isModifierShortcutKey(shortcut.key)) {
            return cloneDefaultShortcut();
        }
        return shortcut;
    }

    currentShortcut = loadShortcutSetting(normalizeShortcutCandidate);

    function refreshKeyboardLayoutMap() {
        if (!navigatorRef.keyboard || typeof navigatorRef.keyboard.getLayoutMap !== 'function') return Promise.resolve(null);
        return navigatorRef.keyboard.getLayoutMap()
            .then((layoutMap) => {
                keyboardLayoutMap = layoutMap;
                currentShortcut = normalizeShortcutCandidate(currentShortcut);
                saveNormalizedShortcutSetting(currentShortcut);
                updateShortcutSettingsUi();
                return layoutMap;
            })
            .catch(() => {
                keyboardLayoutMap = null;
                return null;
            });
    }

    function saveShortcutSetting(shortcut) {
        currentShortcut = persistShortcutSetting(shortcut, normalizeShortcutCandidate);
        updateShortcutSettingsUi();
        return currentShortcut;
    }

    function getShortcutLabels() {
        const { langNames, fallback } = getLanguageState();
        return {
            label: langNames.settingsShortcutLabel || fallback.settingsShortcutLabel || '',
            listening: langNames.settingsShortcutListening || fallback.settingsShortcutListening || '',
            help: langNames.settingsShortcutHelp || fallback.settingsShortcutHelp || '',
            invalid: langNames.settingsShortcutInvalid || fallback.settingsShortcutInvalid || '',
            saved: langNames.settingsShortcutSaved || fallback.settingsShortcutSaved || '',
            reset: langNames.settingsShortcutReset || fallback.settingsShortcutReset || ''
        };
    }

    function formatShortcut(shortcut) {
        const normalized = normalizeShortcutCandidate(shortcut);
        const uiCode = getUiLanguage();
        const shiftLabel = uiCode && uiCode.toLowerCase().startsWith('fr') ? 'Maj' : 'Shift';
        const metaLabel = navigatorRef.platform && /mac/i.test(navigatorRef.platform) ? 'Cmd' : 'Win';
        const parts = [];
        if (normalized.ctrl) parts.push('Ctrl');
        if (normalized.alt) parts.push('Alt');
        if (normalized.shift) parts.push(shiftLabel);
        if (normalized.meta) parts.push(metaLabel);
        parts.push(normalized.displayKey || normalized.key.toUpperCase());
        return parts.join(' + ');
    }

    function shortcutFromKeyboardEvent(e) {
        const key = String(e.key || '').toLowerCase();
        const code = String(e.code || getShortcutCodeFromLegacyKey(key));
        if (!code || isModifierShortcutCode(code) || isModifierShortcutKey(key)) return null;
        return {
            ctrl: !!e.ctrlKey,
            alt: !!e.altKey,
            shift: !!e.shiftKey,
            meta: !!e.metaKey,
            key,
            code,
            displayKey: getDisplayKeyFromCode(code, key)
        };
    }

    function shortcutMatchesEvent(shortcut, e) {
        const normalized = normalizeShortcutCandidate(shortcut);
        const eventCode = String(e && e.code || getShortcutCodeFromLegacyKey(e && e.key));
        return !!e
            && !!e.ctrlKey === normalized.ctrl
            && !!e.altKey === normalized.alt
            && !!e.shiftKey === normalized.shift
            && !!e.metaKey === normalized.meta
            && eventCode === normalized.code;
    }

    function updateShortcutSettingsUi(message = '') {
        if (!shortcutCaptureButton && !shortcutCaptureHelp && !shortcutCaptureLabel) return;
        const labels = getShortcutLabels();
        if (shortcutCaptureLabel) shortcutCaptureLabel.textContent = labels.label;
        if (shortcutCaptureButton) {
            shortcutCaptureButton.textContent = shortcutCaptureActive ? labels.listening : formatShortcut(currentShortcut);
            shortcutCaptureButton.classList.toggle('is-recording', shortcutCaptureActive);
            shortcutCaptureButton.setAttribute('aria-pressed', shortcutCaptureActive ? 'true' : 'false');
        }
        if (shortcutResetButton) {
            shortcutResetButton.title = labels.reset;
            shortcutResetButton.setAttribute('aria-label', labels.reset);
        }
        if (shortcutCaptureHelp) {
            shortcutCaptureHelp.textContent = message || labels.help;
        }
    }

    function bindShortcutControls() {
        if (shortcutCaptureButton) {
            shortcutCaptureButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                shortcutCaptureActive = true;
                refreshKeyboardLayoutMap();
                updateShortcutSettingsUi();
                shortcutCaptureButton.focus();
            });

            shortcutCaptureButton.addEventListener('keydown', (e) => {
                if (!shortcutCaptureActive) return;
                e.preventDefault();
                e.stopPropagation();

                if (e.key === 'Escape' && !hasShortcutModifier({
                    ctrl: e.ctrlKey,
                    alt: e.altKey,
                    shift: e.shiftKey,
                    meta: e.metaKey
                })) {
                    shortcutCaptureActive = false;
                    updateShortcutSettingsUi();
                    return;
                }

                const candidate = shortcutFromKeyboardEvent(e);
                const labels = getShortcutLabels();
                if (!candidate || !hasShortcutModifier(candidate)) {
                    updateShortcutSettingsUi(labels.invalid);
                    return;
                }

                shortcutCaptureActive = false;
                saveShortcutSetting(candidate);
                updateShortcutSettingsUi(labels.saved);
            });

            shortcutCaptureButton.addEventListener('blur', () => {
                if (!shortcutCaptureActive) return;
                shortcutCaptureActive = false;
                updateShortcutSettingsUi();
            });
        }

        if (shortcutResetButton) {
            shortcutResetButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                shortcutCaptureActive = false;
                saveShortcutSetting(cloneDefaultShortcut());
            });
        }
    }

    function bindGlobalShortcut() {
        documentRef.addEventListener('keydown', (e) => {
            if (!shortcutCaptureActive && shortcutMatchesEvent(currentShortcut, e)) {
                e.preventDefault();
                onShortcutTriggered();
            }
        });
    }

    return {
        bindShortcutControls,
        bindGlobalShortcut,
        refreshKeyboardLayoutMap,
        updateShortcutSettingsUi
    };
}
