export function createThemeController({
    windowRef,
    documentRef,
    host,
    translationBox,
    fullscreenOverlay,
    speakButton,
    copyButton,
    fullscreenToggle,
    settingsButton,
    backButton,
    fullscreenSwap,
    fullscreenSourceCopy,
    fullscreenSourceSpeak,
    fullscreenTargetCopy,
    fullscreenTargetSpeak,
    panelThemeSelect,
    panelThemeTrigger,
    panelThemeCurrent,
    panelThemePanel,
    panelThemeGrid,
    normalizePanelTheme,
    loadPanelTheme,
    savePanelTheme,
    getLocalizedThemes,
    refreshLanguagePanelsTheme,
    hideInlinePanels,
    hideLanguagePanels,
    eventPathContains,
    isSpeechStateReady,
    refreshSpeechIconState
}) {
    let currentPanelTheme = loadPanelTheme();

    function getThemeSwatchStyle(themeValue) {
        const normalized = normalizePanelTheme(themeValue);
        if (normalized === 'dark') {
            return '--utst-theme-swatch-bg:#111827;--utst-theme-swatch-border:#475569;';
        }
        if (normalized === 'light') {
            return '--utst-theme-swatch-bg:#f8fafc;--utst-theme-swatch-border:#cbd5e1;';
        }
        return '--utst-theme-swatch-bg:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);--utst-theme-swatch-border:#7db7ff;';
    }

    function getThemeDisplayLabel(themeValue) {
        const normalized = normalizePanelTheme(themeValue);
        const localizedThemes = getLocalizedThemes();
        return localizedThemes[normalized] || normalized;
    }

    function getThemeLabelMarkup(themeValue) {
        const normalized = normalizePanelTheme(themeValue);
        return `<span class="utst-theme-swatch" style="${getThemeSwatchStyle(normalized)}"></span><span>${getThemeDisplayLabel(normalized)}</span>`;
    }

    function getIconDefaultStrokeColor() {
        if (currentPanelTheme === 'light') return '#4a5568';
        if (currentPanelTheme === 'blue') return '#eaf2ff';
        return '#f0f0f0';
    }

    const COPY_FEEDBACK_STROKE = 'rgb(64 130 243)';

    function applyIconThemeColors() {
        const defaultStroke = getIconDefaultStrokeColor();
        [speakButton, copyButton, fullscreenToggle, settingsButton, backButton, fullscreenSwap,
            fullscreenSourceCopy, fullscreenSourceSpeak, fullscreenTargetCopy, fullscreenTargetSpeak
        ].forEach((buttonEl) => {
            if (!buttonEl) return;
            buttonEl.querySelectorAll('svg, svg path, svg line, svg rect, svg polyline').forEach((node) => {
                node.style.stroke = defaultStroke;
            });
        });
        const closeSvg = translationBox.querySelector('#closeButton svg');
        if (closeSvg) closeSvg.style.stroke = '#ff4d4d';
        const fullscreenCloseSvg = fullscreenOverlay.querySelector('#fullscreenClose svg');
        if (fullscreenCloseSvg) fullscreenCloseSvg.style.stroke = '#ff6b6b';
        if (isSpeechStateReady()) refreshSpeechIconState();
    }

    function setButtonIconStroke(buttonEl, stroke) {
        if (!buttonEl) return;
        buttonEl.querySelectorAll('svg, svg path, svg line, svg rect, svg polyline').forEach((node) => {
            node.style.stroke = stroke;
        });
    }

    function getLanguagePanelThemeStyles() {
        if (currentPanelTheme === 'light') {
            return {
                panelBg: 'rgba(255,255,255,0.98)',
                panelBorder: 'rgba(36,58,99,0.18)',
                panelShadow: '0 10px 24px rgba(18,27,44,0.18)',
                searchBg: 'rgba(255,255,255,0.96)',
                searchBorder: 'rgba(38,61,104,0.2)',
                searchColor: '#203150',
                buttonBg: 'rgba(45,92,190,0.06)',
                buttonBorder: 'rgba(38,61,104,0.2)',
                buttonColor: '#203150',
                buttonActiveBg: 'rgba(45,92,190,0.22)',
                buttonActiveBorder: 'rgba(38,61,104,0.5)',
                buttonActiveColor: '#16386c',
                buttonWeight: 500,
                buttonActiveWeight: 650,
                buttonActiveShadow: 'inset 0 0 0 1px rgba(38,61,104,0.12)'
            };
        }

        if (currentPanelTheme === 'dark') {
            return {
                panelBg: 'rgba(18,18,18,0.98)',
                panelBorder: 'rgba(255,255,255,0.08)',
                panelShadow: '0 10px 24px rgba(0,0,0,0.45)',
                searchBg: 'rgba(255,255,255,0.06)',
                searchBorder: 'rgba(255,255,255,0.12)',
                searchColor: '#f0f0f0',
                buttonBg: 'rgba(255,255,255,0.03)',
                buttonBorder: 'rgba(255,255,255,0.1)',
                buttonColor: '#f0f0f0',
                buttonActiveBg: 'rgba(255,255,255,0.14)',
                buttonActiveBorder: 'rgba(255,255,255,0.32)',
                buttonWeight: 500,
                buttonActiveWeight: 600
            };
        }

        return {
            panelBg: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%)',
            panelBorder: 'rgba(255, 255, 255, 0.10)',
            panelShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
            searchBg: 'rgba(255, 255, 255, 0.07)',
            searchBorder: 'rgba(255, 255, 255, 0.14)',
            searchColor: '#ffffff',
            buttonBg: 'rgba(255, 255, 255, 0.06)',
            buttonBorder: 'rgba(255, 255, 255, 0.16)',
            buttonColor: '#ffffff',
            buttonActiveBg: 'rgba(74, 144, 226, 0.34)',
            buttonActiveBorder: 'rgba(139, 177, 255, 0.72)',
            buttonActiveColor: '#ffffff',
            buttonWeight: 500,
            buttonActiveWeight: 650,
            buttonActiveShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10), 0 0 0 1px rgba(74, 144, 226, 0.16)'
        };
    }

    function getThemePanelThemeStyles() {
        return getLanguagePanelThemeStyles();
    }

    function applyThemePanelContainerTheme() {
        if (!panelThemePanel) return;
        const style = getThemePanelThemeStyles();
        panelThemePanel.style.background = style.panelBg;
        panelThemePanel.style.border = `1px solid ${style.panelBorder}`;
        panelThemePanel.style.boxShadow = style.panelShadow;
    }

    function updateThemePickerCurrentLabel() {
        if (!panelThemeCurrent) return;
        const selected = panelThemeSelect ? normalizePanelTheme(panelThemeSelect.value || currentPanelTheme) : currentPanelTheme;
        panelThemeCurrent.innerHTML = getThemeLabelMarkup(selected);
    }

    function renderThemePickerOptions() {
        if (!panelThemeGrid || !panelThemeSelect || !panelThemePanel) return;
        const style = getThemePanelThemeStyles();
        applyThemePanelContainerTheme();
        const selected = normalizePanelTheme(panelThemeSelect.value || currentPanelTheme);
        const isLightTheme = currentPanelTheme === 'light';
        const options = ['blue', 'dark', 'light'];
        panelThemeGrid.innerHTML = options.map((value) => {
            const active = value === selected;
            const activeBorder = isLightTheme ? '#2d5cbe' : style.buttonActiveBorder;
            const idleBorder = isLightTheme ? '#94a3b8' : style.buttonBorder;
            const activeShadow = isLightTheme
                ? 'inset 0 0 0 1px rgba(38,61,104,0.28), 0 0 0 1px rgba(38,61,104,0.18)'
                : (style.buttonActiveShadow || 'none');
            return `<button type="button" data-theme="${value}" style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:8px;
                    padding:6px 8px;
                    text-align:left;
                    border-radius:8px;
                    border:1px solid ${active ? activeBorder : idleBorder};
                    background:${active ? style.buttonActiveBg : style.buttonBg};
                    color:${active && style.buttonActiveColor ? style.buttonActiveColor : style.buttonColor};
                    font-weight:${active ? (style.buttonActiveWeight || 600) : (style.buttonWeight || 500)};
                    box-shadow:${active ? activeShadow : 'none'};
                    cursor:pointer;
                    font-size:12px;
                    transition:background 0.15s ease, border 0.15s ease;
                "><span class="utst-theme-option-label">${getThemeLabelMarkup(value)}</span></button>`;
        }).join('');

        panelThemeGrid.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme') || 'blue';
                panelThemeSelect.value = normalizePanelTheme(theme);
                applyPanelTheme(panelThemeSelect.value, { persist: true });
                if (panelThemePanel) panelThemePanel.style.display = 'none';
            });
        });
    }

    function refreshLanguagePanelTheme() {
        refreshLanguagePanelsTheme({
            afterContainers: applyThemePanelContainerTheme,
            afterFullscreen: () => {
                if (panelThemePanel && panelThemeGrid && (panelThemePanel.style.display === 'block' || panelThemeGrid.childElementCount > 0)) {
                    renderThemePickerOptions();
                }
            }
        });
    }

    function applyPanelTheme(theme, { persist = false } = {}) {
        const normalizedTheme = normalizePanelTheme(theme);
        currentPanelTheme = normalizedTheme;
        if (persist) {
            savePanelTheme(normalizedTheme);
        }
        documentRef.documentElement.classList.remove('utst-theme-blue', 'utst-theme-dark', 'utst-theme-light');
        documentRef.documentElement.classList.add(`utst-theme-${normalizedTheme}`);
        if (host) {
            host.classList.remove('utst-theme-blue', 'utst-theme-dark', 'utst-theme-light');
            host.classList.add(`utst-theme-${normalizedTheme}`);
        }
        if (panelThemeSelect) {
            panelThemeSelect.value = normalizedTheme;
        }
        applyIconThemeColors();
        updateThemePickerCurrentLabel();
        refreshLanguagePanelTheme();
    }

    function applyCurrentPanelTheme() {
        applyPanelTheme(currentPanelTheme);
    }

    function positionThemePanel() {
        if (!panelThemePanel || panelThemePanel.style.display !== 'block' || !panelThemeTrigger) return;
        const rect = panelThemeTrigger.getBoundingClientRect();
        const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
        const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
        const width = Math.round(rect.width || 260);
        const panelWidth = Math.max(width, 220);
        const left = Math.min(rect.left + scrollX, scrollX + windowRef.innerWidth - panelWidth - 10);
        const top = rect.bottom + scrollY + 6;
        panelThemePanel.style.position = 'absolute';
        panelThemePanel.style.left = `${Math.max(scrollX + 10, left)}px`;
        panelThemePanel.style.top = `${top}px`;
        panelThemePanel.style.right = 'auto';
        panelThemePanel.style.width = `${panelWidth}px`;
        panelThemePanel.style.maxWidth = `${Math.max(180, windowRef.innerWidth - 20)}px`;
        panelThemePanel.style.zIndex = '2147483646';
    }

    function refreshThemeOptionsLabels() {
        if (panelThemeSelect) {
            const blueOption = panelThemeSelect.querySelector('option[value="blue"]');
            const darkOption = panelThemeSelect.querySelector('option[value="dark"]');
            const lightOption = panelThemeSelect.querySelector('option[value="light"]');
            const localizedThemes = getLocalizedThemes();
            if (blueOption) blueOption.textContent = localizedThemes.blue || 'Blue';
            if (darkOption) darkOption.textContent = localizedThemes.dark || 'Dark';
            if (lightOption) lightOption.textContent = localizedThemes.light || 'Light';
        }
        updateThemePickerCurrentLabel();
        renderThemePickerOptions();
    }

    function bindThemeControls() {
        if (panelThemeSelect) {
            panelThemeSelect.addEventListener('change', () => {
                applyPanelTheme(panelThemeSelect.value || 'blue', { persist: true });
            });
        }

        if (panelThemeTrigger) {
            panelThemeTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = panelThemePanel && panelThemePanel.style.display === 'block';
                hideInlinePanels();
                hideLanguagePanels();
                if (!panelThemePanel) return;
                if (isOpen) {
                    panelThemePanel.style.display = 'none';
                    return;
                }
                renderThemePickerOptions();
                panelThemePanel.style.display = 'block';
                positionThemePanel();
            });
        }
    }

    function closeThemePanelFromOutside(event) {
        if (panelThemePanel && !eventPathContains(event, panelThemePanel) && panelThemeTrigger && !eventPathContains(event, panelThemeTrigger)) {
            panelThemePanel.style.display = 'none';
        }
    }

    return {
        COPY_FEEDBACK_STROKE,
        applyCurrentPanelTheme,
        applyIconThemeColors,
        bindThemeControls,
        closeThemePanelFromOutside,
        getIconDefaultStrokeColor,
        getLanguagePanelThemeStyles,
        positionThemePanel,
        refreshLanguagePanelTheme,
        refreshThemeOptionsLabels,
        setButtonIconStroke
    };
}
