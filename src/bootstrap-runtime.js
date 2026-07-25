export const UTST_LOGO_URL = 'https://raw.githubusercontent.com/DREwX-code/Ultimate-Text-Selection-Translator/refs/heads/main/assets/icons/Icon_Translate_Script.png';

export function createBootstrapRuntime({
    windowRef,
    documentRef,
    globalRef,
    getImageConstructor,
    logoUrl,
    addStyle,
    getShadowSafeStyleText,
    setImportantStyle,
    makeEvent
}) {
    let utstLogoPreloadImage = null;
    let utstLogoLoaded = false;
    let utstUiRoot = null;

    function preloadUtstLogo() {
        if (utstLogoPreloadImage) return;
        const ImageConstructor = getImageConstructor();
        if (!ImageConstructor) return;
        utstLogoPreloadImage = new ImageConstructor();
        utstLogoPreloadImage.decoding = 'async';
        utstLogoPreloadImage.referrerPolicy = 'no-referrer';
        if ('fetchPriority' in utstLogoPreloadImage) {
            utstLogoPreloadImage.fetchPriority = 'low';
        }
        utstLogoPreloadImage.onload = () => {
            utstLogoLoaded = true;
            windowRef.dispatchEvent(makeEvent('utst-logo-loaded'));
        };
        utstLogoPreloadImage.src = logoUrl;
    }

    function scheduleUtstLogoPreload() {
        const runWhenIdle = () => {
            if (typeof windowRef.requestIdleCallback === 'function') {
                windowRef.requestIdleCallback(preloadUtstLogo, { timeout: 3000 });
            } else {
                windowRef.setTimeout(preloadUtstLogo, 800);
            }
        };

        if (documentRef.readyState === 'complete') {
            windowRef.setTimeout(runWhenIdle, 0);
        } else {
            windowRef.addEventListener('load', runWhenIdle, { once: true });
        }
    }

    function createIsolatedUiRoot(cssText) {
        const host = documentRef.createElement('div');
        host.id = 'utstShadowHost';
        setImportantStyle(host, 'all', 'initial');
        setImportantStyle(host, 'position', 'static');
        setImportantStyle(host, 'display', 'contents');
        // Prevent a flash of unstyled controls while the isolated UI is built.
        setImportantStyle(host, 'visibility', 'hidden');
        setImportantStyle(host, 'pointer-events', 'none');
        setImportantStyle(host, 'font-size', '14px');
        setImportantStyle(host, 'line-height', 'normal');
        setImportantStyle(host, 'color', '#fff');
        setImportantStyle(host, 'z-index', '2147483647');
        setImportantStyle(host, 'color-scheme', 'normal');
        setImportantStyle(host, 'forced-color-adjust', 'none');

        if (host.attachShadow) {
            const root = host.attachShadow({ mode: 'open' });
            const style = documentRef.createElement('style');
            style.textContent = getShadowSafeStyleText(cssText);
            root.appendChild(style);
            documentRef.documentElement.appendChild(host);
            return { host, root, usesShadow: true };
        }

        addStyle(cssText);
        documentRef.documentElement.appendChild(host);
        return { host, root: host, usesShadow: false };
    }

    function eventPathContains(event, element) {
        if (!event || !element) return false;
        const path = typeof event.composedPath === 'function' ? event.composedPath() : null;
        return (path && path.includes(element)) || (event.target && element.contains(event.target));
    }

    function getTranslationLibrary() {
        return (windowRef ? windowRef.TraductionOutilTranslator : null)
            || (globalRef ? globalRef.TraductionOutilTranslator : null);
    }

    function hydrateUtstLogoImages() {
        utstUiRoot.querySelectorAll('img[data-utst-logo-src]').forEach((img) => {
            if (!img || img.getAttribute('src')) return;
            img.src = img.getAttribute('data-utst-logo-src') || UTST_LOGO_URL;
        });
    }

    function connectLogoHydration(root) {
        utstUiRoot = root;
        if (utstLogoLoaded) {
            hydrateUtstLogoImages();
        } else {
            windowRef.addEventListener('utst-logo-loaded', hydrateUtstLogoImages, { once: true });
        }
    }

    return {
        connectLogoHydration,
        createIsolatedUiRoot,
        eventPathContains,
        getTranslationLibrary,
        scheduleUtstLogoPreload
    };
}
