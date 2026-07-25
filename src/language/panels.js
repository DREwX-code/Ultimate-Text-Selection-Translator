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

    function togglePanel(panelEl, otherPanel) {
        if (!panelEl) return;
        const isOpen = panelEl.style.display === 'block';
        hideLanguagePanels();
        panelEl.style.display = isOpen ? 'none' : 'block';
    }

    function bindFullscreenPanelTriggers() {
        if (fullscreenSourceLangTrigger) fullscreenSourceLangTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(fullscreenSourceLangPanel, fullscreenTargetLangPanel);
            renderLanguageGrid(fullscreenSourceLangGrid, fullscreenSourceLangSearch, fullscreenSourceLangSelect, fullscreenSourceLangCurrent, fullscreenSourceLangPanel);
        });

        if (fullscreenTargetLangTrigger) fullscreenTargetLangTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(fullscreenTargetLangPanel, fullscreenSourceLangPanel);
            renderLanguageGrid(fullscreenTargetLangGrid, fullscreenTargetLangSearch, fullscreenTargetLangSelect, fullscreenTargetLangCurrent, fullscreenTargetLangPanel);
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
        inlineLanguagePanels.forEach(({ panel, selectEl }) => {
            if (!eventPathContains(event, panel) && !eventPathContains(event, selectEl)) {
                panel.style.display = 'none';
            }
        });
    }

    function hideInlinePanels(except) {
        inlineLanguagePanels.forEach(p => {
            if (p.panel === except) return;
            p.panel.style.display = 'none';
        });
    }

    function positionInlinePanel(panel, selectEl) {
        if (!panel || panel.style.display !== 'block' || !selectEl) return;
        const rect = selectEl.getBoundingClientRect();
        const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
        const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
        const panelWidth = panel.offsetWidth || 280;
        const left = Math.min(rect.left + scrollX, scrollX + windowRef.innerWidth - panelWidth - 10);
        const top = rect.bottom + scrollY + 4;
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
    }

    function updateInlinePanelsPosition() {
        inlineLanguagePanels.forEach(({ panel, selectEl }) => {
            positionInlinePanel(panel, selectEl);
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
            positionInlinePanel(panel, selectEl);
        };

        selectEl.addEventListener('pointerdown', openInlinePanel, { capture: true });
        selectEl.addEventListener('mousedown', openInlinePanel);
        selectEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                openInlinePanel(e);
            }
        });
    }

    function isClickInInlineLanguagePanel(event) {
        return inlineLanguagePanels.some(({ panel, selectEl }) =>
            eventPathContains(event, panel) || eventPathContains(event, selectEl)
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
