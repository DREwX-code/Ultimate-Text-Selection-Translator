import { translationLibrary } from './library/translation.js';

export const UTST_LOGO_URL = 'https://raw.githubusercontent.com/DREwX-code/Ultimate-Text-Selection-Translator/refs/heads/main/assets/icons/Icon_Translate_Script_no-background.png';

export function createBootstrapRuntime({
    documentRef,
    getShadowSafeStyleText,
    setImportantStyle
}) {
    function createIsolatedUiRoot(cssText) {
        if (documentRef.getElementById('utstShadowHost')) return null;
        const host = documentRef.createElement('div');
        if (!host.attachShadow) return null;
        host.id = 'utstShadowHost';
        const hostStyles = {
            all: 'initial',
            position: 'static',
            display: 'contents',
            visibility: 'hidden',
            'pointer-events': 'none',
            'font-size': '14px',
            'line-height': 'normal',
            color: '#fff',
            'z-index': '2147483647',
            'color-scheme': 'normal'
        };
        for (const [property, value] of Object.entries(hostStyles)) {
            setImportantStyle(host, property, value);
        }
        const root = host.attachShadow({ mode: 'open' });
        const style = documentRef.createElement('style');
        style.textContent = getShadowSafeStyleText(cssText);
        root.appendChild(style);
        documentRef.documentElement.appendChild(host);
        return { host, root, usesShadow: true };
    }
    function eventPathContains(event, element) {
        if (!event || !element) return false;
        const path = typeof event.composedPath === 'function' ? event.composedPath() : null;
        return (path && path.includes(element)) || (event.target && element.contains(event.target));
    }
    function connectLogoHydration(root) {
        root.querySelectorAll('img[data-utst-logo-src]').forEach(img => {
            img.src = UTST_LOGO_URL;
        });
    }
    return {
        connectLogoHydration,
        createIsolatedUiRoot,
        eventPathContains,
        getTranslationLibrary: () => translationLibrary
    };
}
