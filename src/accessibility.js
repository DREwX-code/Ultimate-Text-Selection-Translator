export function enhanceAccessibility(root) {
    root.querySelectorAll('div[style*="cursor:pointer"], div[style*="cursor: pointer"]').forEach(element => {
        if (!element.id || element.id === 'dragHandle') return;
        element.setAttribute('role', 'button');
        element.tabIndex = 0;
        if (!element.textContent.trim()) element.setAttribute('aria-label', element.title || element.id.replace(/([A-Z])/g, ' $1'));
        element.addEventListener('keydown', event => {
            if (event.target === element && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault(); element.click();
            }
        });
    });
    root.querySelectorAll('input, textarea').forEach(element => {
        if (!element.labels?.length) element.setAttribute('aria-label', element.placeholder || element.id.replace(/([A-Z])/g, ' $1'));
    });
    const overlay = root.querySelector('#fullscreenOverlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'fullscreenTitle');
    overlay.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const elements = [...overlay.querySelectorAll('button, input, textarea, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
        const first = elements[0], last = elements.at(-1), active = root.activeElement;
        if (event.shiftKey && (active === first || !overlay.contains(active))) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && (active === last || !overlay.contains(active))) { event.preventDefault(); first?.focus(); }
    });
}

export async function copyText(text, documentRef = document) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const field = documentRef.createElement('textarea');
        field.value = text;
        field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
        const host = documentRef.getElementById('utstShadowHost');
        const root = host?.shadowRoot || documentRef.body;
        const focused = root.activeElement || documentRef.activeElement;
        root.appendChild(field);
        field.select();
        let copied = false;
        try { copied = documentRef.execCommand('copy'); } catch { copied = false; }
        field.remove();
        focused?.focus?.({ preventScroll: true });
        return copied;
    }
}
