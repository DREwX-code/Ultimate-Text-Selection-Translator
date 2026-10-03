import { positionMenu } from '../viewport.js';
export function createLanguagePanels({
    windowRef,
    documentRef,
    root,
    fullscreenSourceLangSelect,
    fullscreenTargetLangSelect,
    fullscreenSourceLangCurrent,
    fullscreenTargetLangCurrent,
    fullscreenSourceLangSearch,
    fullscreenTargetLangSearch,
    fullscreenSourceLangGrid,
    fullscreenTargetLangGrid,
    fullscreenSourceLangPanel,
    fullscreenTargetLangPanel,
    fullscreenSourceLangTrigger,
    fullscreenTargetLangTrigger,
    getDefaultTargetLanguage,
    getLanguageLabel,
    getNavigatorPlaceholder,
    getPanelThemeStyles,
    applyLanguageGridSelection,
    updateLanguageGridCurrentLabel,
    onFullscreenLanguageSelection,
    eventPathContains,
    createChangeEvent
}) {
    const inlineLanguagePanels = [];

    function applyLanguagePanelContainerTheme(panelEl, searchEl) {
        if (!panelEl) return;
        const style = getPanelThemeStyles();
        panelEl.style.background = style.panelBg;
        panelEl.style.border = `1px solid ${style.panelBorder}`;
        panelEl.style.boxShadow = style.panelShadow;

        if (searchEl) {
            searchEl.style.background = style.searchBg;
            searchEl.style.border = `1px solid ${style.searchBorder}`;
            searchEl.style.color = style.searchColor;
        }
    }

    function hideLanguagePanels() {
        if (fullscreenSourceLangPanel) fullscreenSourceLangPanel.style.display = 'none';
        if (fullscreenTargetLangPanel) fullscreenTargetLangPanel.style.display = 'none';
    }

    function getLanguageGridCurrentValue(selectEl) {
        const firstUsableOption = Array.from(selectEl.options || []).find(opt => !opt.disabled && opt.value);
        if (selectEl.value) return selectEl.value;
        if (selectEl.querySelector('option[value="auto"]')) return 'auto';
        return firstUsableOption ? firstUsableOption.value : getDefaultTargetLanguage();
    }

    function getLanguageGridOptions(selectEl, customOptions) {
        if (customOptions && customOptions.length) {
            return customOptions.map(({ value, label }) => ({ code: value, name: label }));
        }
        return Array.from(selectEl.options)
            .filter(option => !option.disabled && option.value)
            .map(option => ({ code: option.value, name: option.textContent || getLanguageLabel(option.value) }));
    }

    function languageGridOptionMatchesQuery(option, query) {
        if (!query) return true;
        const name = String(option.name || '').toLowerCase();
        const code = String(option.code || '').toLowerCase();
        return name.includes(query) || code.includes(query);
    }

    function buildLanguageGridButton(option, current, style) {
        const active = option.code === current;
        return `<button data-code="${option.code}" style="
                padding:6px 8px;
                text-align:left;
                border-radius:8px;
                border:1px solid ${active ? style.buttonActiveBorder : style.buttonBorder};
                background:${active ? style.buttonActiveBg : style.buttonBg};
                color:${active && style.buttonActiveColor ? style.buttonActiveColor : style.buttonColor};
                font-weight:${active ? (style.buttonActiveWeight || 600) : (style.buttonWeight || 500)};
                box-shadow:${active ? (style.buttonActiveShadow || 'none') : 'none'};
                cursor:pointer;
                font-size:12px;
                transition:background 0.15s ease, border 0.15s ease;
            ">${option.name}</button>`;
    }

    function bindLanguageGridButtons(gridEl, searchEl, selectEl, currentLabelEl, panelEl, customOptions) {
        gridEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                if (!code || !selectEl.querySelector(`option[value="${code}"]`)) return;
                applyLanguageGridSelection(code, selectEl);
                updateLanguageGridCurrentLabel(currentLabelEl, code);
                renderLanguageGrid(gridEl, searchEl, selectEl, currentLabelEl, panelEl, customOptions);
                if (panelEl) panelEl.style.display = 'none';
                if (selectEl === fullscreenTargetLangSelect || selectEl === fullscreenSourceLangSelect) {
                    onFullscreenLanguageSelection();
                }
            });
        });
    }

    function renderLanguageGrid(gridEl, searchEl, selectEl, currentLabelEl, panelEl, customOptions) {
        if (!gridEl || !selectEl) return;
        const style = getPanelThemeStyles();
        applyLanguagePanelContainerTheme(panelEl, searchEl);
        const query = (searchEl && searchEl.value || '').toLowerCase();
        const current = getLanguageGridCurrentValue(selectEl);
        const buttons = getLanguageGridOptions(selectEl, customOptions)
            .filter(option => languageGridOptionMatchesQuery(option, query))
            .map(option => buildLanguageGridButton(option, current, style));
        gridEl.innerHTML = buttons.join('');
        bindLanguageGridButtons(gridEl, searchEl, selectEl, currentLabelEl, panelEl, customOptions);
        updateLanguageGridCurrentLabel(currentLabelEl, current);
    }

    function renderInlineLanguageGridForTheme(panel, selectEl) {
        if (!panel || !selectEl) return;
        const searchEl = panel.querySelector('.inlineLangSearch');
        const gridEl = panel.querySelector('.inlineLangGrid');
        if (!gridEl) return;
        const shouldRender = panel.style.display === 'block' || gridEl.childElementCount > 0;
        if (!shouldRender) return;
        const opts = Array.from(selectEl.options)
            .filter(o => !o.disabled)
            .map(o => ({ value: o.value, label: o.textContent || o.value }));
        renderLanguageGrid(gridEl, searchEl, selectEl, null, panel, opts);
    }

    function refreshLanguagePanelsTheme({ afterContainers, afterFullscreen } = {}) {
        applyLanguagePanelContainerTheme(fullscreenSourceLangPanel, fullscreenSourceLangSearch);
        applyLanguagePanelContainerTheme(fullscreenTargetLangPanel, fullscreenTargetLangSearch);
        if (afterContainers) afterContainers();
        if (fullscreenSourceLangGrid && fullscreenSourceLangSelect
            && (fullscreenSourceLangPanel.style.display === 'block' || fullscreenSourceLangGrid.childElementCount > 0)) {
            renderLanguageGrid(fullscreenSourceLangGrid, fullscreenSourceLangSearch, fullscreenSourceLangSelect, fullscreenSourceLangCurrent, fullscreenSourceLangPanel);
        }
        if (fullscreenTargetLangGrid && fullscreenTargetLangSelect
            && (fullscreenTargetLangPanel.style.display === 'block' || fullscreenTargetLangGrid.childElementCount > 0)) {
            renderLanguageGrid(fullscreenTargetLangGrid, fullscreenTargetLangSearch, fullscreenTargetLangSelect, fullscreenTargetLangCurrent, fullscreenTargetLangPanel);
        }
        if (afterFullscreen) afterFullscreen();
        inlineLanguagePanels.forEach(({ panel }) => {
            const searchEl = panel.querySelector('.inlineLangSearch');
            applyLanguagePanelContainerTheme(panel, searchEl);
        });
        inlineLanguagePanels.forEach(({ panel, selectEl }) => {
            renderInlineLanguageGridForTheme(panel, selectEl);
        });
    }

    function refreshInlineLanguagePlaceholders() {
        inlineLanguagePanels.forEach(({ panel }) => {
            const searchEl = panel.querySelector('.inlineLangSearch');
            if (searchEl) searchEl.placeholder = getNavigatorPlaceholder();
        });
    }

    function bindFullscreenLanguageSearchControls() {
        if (fullscreenSourceLangSearch) fullscreenSourceLangSearch.addEventListener('input', () => {
            renderLanguageGrid(fullscreenSourceLangGrid, fullscreenSourceLangSearch, fullscreenSourceLangSelect, fullscreenSourceLangCurrent, fullscreenSourceLangPanel);
        });
        if (fullscreenTargetLangSearch) fullscreenTargetLangSearch.addEventListener('input', () => {
            renderLanguageGrid(fullscreenTargetLangGrid, fullscreenTargetLangSearch, fullscreenTargetLangSelect, fullscreenTargetLangCurrent, fullscreenTargetLangPanel);
        });
    }

    function togglePanel(panelEl) {
        if (!panelEl) return;
        const isOpen = panelEl.style.display === 'block';
        hideLanguagePanels();
        panelEl.style.display = isOpen ? 'none' : 'block';
    }

    function positionFullscreenMenu(panel, trigger) {
        if (!panel || panel.style.display !== 'block') return;
        const overlay = root.querySelector('#fullscreenOverlay');
        if (panel.parentElement !== overlay) overlay.appendChild(panel);
        positionMenu(panel, trigger, windowRef);
        const rect = overlay.getBoundingClientRect();
        panel.style.left = `${parseFloat(panel.style.left) - windowRef.scrollX - rect.left}px`;
        panel.style.top = `${parseFloat(panel.style.top) - windowRef.scrollY - rect.top}px`;
        panel.style.right = 'auto';
    }

    function bindFullscreenPanelTriggers() {
        if (fullscreenSourceLangTrigger) fullscreenSourceLangTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(fullscreenSourceLangPanel);
            renderLanguageGrid(fullscreenSourceLangGrid, fullscreenSourceLangSearch, fullscreenSourceLangSelect, fullscreenSourceLangCurrent, fullscreenSourceLangPanel);
            positionFullscreenMenu(fullscreenSourceLangPanel, fullscreenSourceLangTrigger);
        });

        if (fullscreenTargetLangTrigger) fullscreenTargetLangTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(fullscreenTargetLangPanel);
            renderLanguageGrid(fullscreenTargetLangGrid, fullscreenTargetLangSearch, fullscreenTargetLangSelect, fullscreenTargetLangCurrent, fullscreenTargetLangPanel);
            positionFullscreenMenu(fullscreenTargetLangPanel, fullscreenTargetLangTrigger);
        });
    }

    function closeLanguagePanelsFromOutside(event, { beforeInline } = {}) {
        if (fullscreenSourceLangPanel && !eventPathContains(event, fullscreenSourceLangPanel) && fullscreenSourceLangTrigger && !eventPathContains(event, fullscreenSourceLangTrigger)) {
            fullscreenSourceLangPanel.style.display = 'none';
        }
        if (fullscreenTargetLangPanel && !eventPathContains(event, fullscreenTargetLangPanel) && fullscreenTargetLangTrigger && !eventPathContains(event, fullscreenTargetLangTrigger)) {
            fullscreenTargetLangPanel.style.display = 'none';
        }
        if (beforeInline) beforeInline();
        inlineLanguagePanels.forEach(({ panel, selectEl, trigger }) => {
            if (!eventPathContains(event, panel) && !eventPathContains(event, selectEl) && !eventPathContains(event, trigger)) {
                panel.style.display = 'none';
                trigger?.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function hideInlinePanels(except) {
        inlineLanguagePanels.forEach(p => {
            if (p.panel === except) return;
            p.panel.style.display = 'none';
            p.trigger?.setAttribute('aria-expanded', 'false');
        });
    }

    function positionInlinePanel(panel, selectEl) {
        if (!panel || panel.style.display !== 'block' || !selectEl) return;
        positionMenu(panel, selectEl, windowRef);
    }

    function updateInlinePanelsPosition() {
        positionFullscreenMenu(fullscreenSourceLangPanel, fullscreenSourceLangTrigger);
        positionFullscreenMenu(fullscreenTargetLangPanel, fullscreenTargetLangTrigger);
        inlineLanguagePanels.forEach(({ panel, trigger }) => {
            positionInlinePanel(panel, trigger);
        });
    }

    function buildInlinePanel(selectEl, placeholder = getNavigatorPlaceholder()) {
        const panel = documentRef.createElement('div');
        panel.style.cssText = `
            all: initial;
            display:none;
            position: absolute;
            width: 280px;
            max-height: 260px;
            background: rgba(30,30,47,0.98);
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 10px 24px rgba(0,0,0,0.35);
            border-radius: 10px;
            padding: 8px;
            z-index: 2147483646;
        `;
        panel.innerHTML = `
            <input class="inlineLangSearch" placeholder="${placeholder}" style="width:100%; max-width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.08); color:#fff; font-size:13px; outline:none;" />
            <div class="inlineLangGrid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:6px; max-height:190px; overflow-y:auto; padding-top:8px;"></div>
        `;
        panel.classList.add('utst-inline-lang-panel');
        const searchEl = panel.querySelector('.inlineLangSearch');
        applyLanguagePanelContainerTheme(panel, searchEl);
        panel.classList.add("utst-scroll");
        root.appendChild(panel);
        inlineLanguagePanels.push({ panel, selectEl });
        return panel;
    }

    function attachInlineLanguagePanel(selectEl) {
        if (!selectEl) return;
        const panel = buildInlinePanel(selectEl);
        // A real button receives taps; the native select remains the value/label model.
        // Never intercept pointerdown: the browser must be free to start scrolling.
        const picker = documentRef.createElement('div');
        picker.className = 'utst-language-picker';
        const trigger = documentRef.createElement('button');
        trigger.id = `${selectEl.id}Trigger`;
        trigger.type = 'button';
        trigger.className = 'utst-language-trigger';
        trigger.setAttribute('aria-haspopup', 'dialog');
        panel.id = `${selectEl.id}Menu`;
        trigger.setAttribute('aria-controls', panel.id);
        const syncLabel = () => {
            trigger.setAttribute('aria-label', selectEl.selectedOptions[0]?.textContent || getNavigatorPlaceholder());
            trigger.setAttribute('aria-expanded', String(panel.style.display === 'block'));
        };
        for (const label of [...(selectEl.labels || [])]) label.htmlFor = trigger.id;
        selectEl.before(picker);
        picker.append(selectEl, trigger);
        selectEl.tabIndex = -1;
        selectEl.setAttribute('aria-hidden', 'true');
        inlineLanguagePanels.find(entry => entry.panel === panel).trigger = trigger;
        syncLabel();
        selectEl.addEventListener('change', syncLabel);
        trigger.addEventListener('focus', syncLabel);
        const searchEl = panel.querySelector('.inlineLangSearch');
        const gridEl = panel.querySelector('.inlineLangGrid');

        function render() {
            const opts = Array.from(selectEl.options)
                .filter(o => !o.disabled)
                .map(o => ({ value: o.value, label: o.textContent || o.value }));
            renderLanguageGrid(gridEl, searchEl, selectEl, null, panel, opts);
            gridEl.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const code = btn.getAttribute('data-code');
                    selectEl.value = code;
                    selectEl.dispatchEvent(createChangeEvent());
                    hideInlinePanels();
                });
            });
        }

        if (searchEl) searchEl.addEventListener('input', render);

        const openInlinePanel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = panel.style.display === 'block';
            hideInlinePanels(panel);
            if (isOpen) {
                panel.style.display = 'none';
                return;
            }
            render();
            panel.style.display = 'block';
            positionInlinePanel(panel, trigger);
            syncLabel();
        };
        let start = null;
        let moved = false;
        trigger.addEventListener('pointerdown', event => { start = { x: event.clientX, y: event.clientY }; moved = false; });
        trigger.addEventListener('pointermove', event => {
            if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) moved = true;
        }, { passive: true });
        trigger.addEventListener('pointercancel', () => { moved = true; start = null; });
        trigger.addEventListener('click', event => {
            if (moved && event.detail !== 0) { event.preventDefault(); return; }
            openInlinePanel(event);
            syncLabel();
        });
    }

    function isClickInInlineLanguagePanel(event) {
        return inlineLanguagePanels.some(({ panel, selectEl, trigger }) =>
            eventPathContains(event, panel) || eventPathContains(event, selectEl) || eventPathContains(event, trigger)
        );
    }

    function isClickInFullscreenLanguagePanel(event) {
        return [fullscreenSourceLangPanel, fullscreenTargetLangPanel, fullscreenSourceLangTrigger, fullscreenTargetLangTrigger]
            .some(el => el && eventPathContains(event, el));
    }

    return {
        attachInlineLanguagePanel,
        bindFullscreenLanguageSearchControls,
        bindFullscreenPanelTriggers,
        closeLanguagePanelsFromOutside,
        hideInlinePanels,
        hideLanguagePanels,
        isClickInFullscreenLanguagePanel,
        isClickInInlineLanguagePanel,
        refreshInlineLanguagePlaceholders,
        refreshLanguagePanelsTheme,
        renderLanguageGrid,
        updateInlinePanelsPosition
    };
}
