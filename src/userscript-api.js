export function createUserscriptApi({ read, write, request, registerMenu, modern } = {}) {
    const values = new Map();
    const writes = new Map();
    const readValue = read || modern?.getValue?.bind(modern);
    const writeValue = write || modern?.setValue?.bind(modern);
    const send = request || modern?.xmlHttpRequest?.bind(modern);
    const addMenuCommand = registerMenu || modern?.registerMenuCommand?.bind(modern);
    async function initialize(keys) {
        await Promise.all(keys.map(async key => {
            try { values.set(key, await readValue?.(key)); }
            catch { values.delete(key); }
        }));
    }
    function getValue(key, fallback) { return values.get(key) ?? fallback; }
    function setValue(key, value) {
        values.set(key, value);
        const pending = (writes.get(key) || Promise.resolve()).then(() => writeValue?.(key, value)).catch(() => {
            console.warn('[UTST] Settings could not be saved; changes remain available in this page.');
        });
        writes.set(key, pending);
        pending.finally(() => { if (writes.get(key) === pending) writes.delete(key); });
        return pending;
    }
    function xmlHttpRequest(options) {
        if (!send) throw new Error('Userscript network API unavailable');
        let settled = false;
        const finish = (name, value) => {
            if (settled) return;
            settled = true;
            options[name]?.(value);
        };
        const handle = send({ ...options,
            onload: value => finish('onload', value), onerror: value => finish('onerror', value),
            ontimeout: value => finish('ontimeout', value), onabort: value => finish('onabort', value) });
        if (handle?.then) handle.then(response => {
            if (response && typeof response.status === 'number') finish('onload', response);
        }, error => finish('onerror', error));
        return { abort() { finish('onabort'); handle?.abort?.(); } };
    }
    function registerMenuCommand(label, callback, options) {
        if (typeof addMenuCommand !== 'function') return null;
        try {
            return addMenuCommand(label, callback, options);
        } catch {
            try {
                return addMenuCommand(label, callback);
            } catch {
                return null;
            }
        }
    }
    return { initialize, getValue, setValue, xmlHttpRequest, registerMenuCommand };
}

export const userscriptApi = createUserscriptApi({
    read: typeof GM_getValue === 'function' ? GM_getValue : undefined,
    write: typeof GM_setValue === 'function' ? GM_setValue : undefined,
    request: typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : undefined,
    registerMenu: typeof GM_registerMenuCommand === 'function' ? GM_registerMenuCommand : undefined,
    modern: typeof GM === 'object' ? GM : undefined
});
