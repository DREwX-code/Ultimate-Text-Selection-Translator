export function getShortcutCodeFromLegacyKey(key) {
    const keyText = String(key || '');
    if (!keyText) return '';
    if (/^[a-z]$/i.test(keyText)) return `Key${keyText.toUpperCase()}`;
    if (/^[0-9]$/.test(keyText)) return `Digit${keyText}`;
    const specialKeys = {
        ' ': 'Space',
        space: 'Space',
        arrowup: 'ArrowUp',
        arrowdown: 'ArrowDown',
        arrowleft: 'ArrowLeft',
        arrowright: 'ArrowRight',
        escape: 'Escape',
        esc: 'Escape',
        enter: 'Enter',
        tab: 'Tab',
        backspace: 'Backspace',
        delete: 'Delete'
    };
    return specialKeys[keyText.toLowerCase()] || '';
}

export function formatLayoutMapKey(value) {
    const text = String(value || '');
    if (!text) return '';
    return text.length === 1 ? text.toUpperCase() : text;
}

function getAsciiFallbackKey(fallbackKey) {
    const keyText = String(fallbackKey || '');
    return keyText.length === 1 && !/[^\x20-\x7E]/.test(keyText) ? keyText.toUpperCase() : '';
}

export function getLetterOrDigitCodeLabel(codeText, fallbackKey, prefixLength) {
    return getAsciiFallbackKey(fallbackKey) || codeText.slice(prefixLength);
}

export function getSpecialCodeLabel(codeText) {
    const specialCodes = {
        ' ': 'Space',
        Space: 'Space',
        ArrowUp: 'Up',
        ArrowDown: 'Down',
        ArrowLeft: 'Left',
        ArrowRight: 'Right',
        Escape: 'Esc',
        Enter: 'Enter',
        Tab: 'Tab',
        Backspace: 'Backspace',
        Delete: 'Delete',
        Insert: 'Insert',
        Home: 'Home',
        End: 'End',
        PageUp: 'Page Up',
        PageDown: 'Page Down',
        Minus: '-',
        Equal: '=',
        BracketLeft: '[',
        BracketRight: ']',
        Backslash: '\\',
        Semicolon: ';',
        Quote: "'",
        Backquote: '`',
        Comma: ',',
        Period: '.',
        Slash: '/',
        NumpadAdd: 'Num +',
        NumpadSubtract: 'Num -',
        NumpadMultiply: 'Num *',
        NumpadDivide: 'Num /',
        NumpadDecimal: 'Num .',
        NumpadEnter: 'Num Enter'
    };
    return specialCodes[codeText] || '';
}

export function isModifierShortcutKey(key) {
    return ['control', 'ctrl', 'shift', 'alt', 'meta', 'os'].includes(String(key || '').toLowerCase());
}

export function isModifierShortcutCode(code) {
    return [
        'ControlLeft',
        'ControlRight',
        'ShiftLeft',
        'ShiftRight',
        'AltLeft',
        'AltRight',
        'MetaLeft',
        'MetaRight',
        'OSLeft',
        'OSRight'
    ].includes(String(code || ''));
}

export function hasShortcutModifier(shortcut) {
    return !!(shortcut && (shortcut.ctrl || shortcut.alt || shortcut.shift || shortcut.meta));
}
