import { getViewport, clampPosition } from './viewport.js';
export function createSelectionController({
    windowRef,
    documentRef,
    selectionBubble,
    selectionBubbleClose,
    selectionBubbleAction,
    bubbleCloseMenu,
    bubbleHideSiteButton,
    bubbleHideGlobalButton,
    translationBox,
    fullscreenOverlay,
    selectionBubbleEnabledCheckbox,
    bubbleBlacklistInput,
    bubbleBlacklistAddButton,
    bubbleBlacklistList,
    margin,
    eventPathContains,
    loadSelectionBubbleEnabled,
    loadBubbleBlacklist,
    saveSelectionBubbleEnabled,
    saveBubbleBlacklist,
    getLanguageState,
    onTranslateSelection,
    setTimer,
    clearTimer
}) {
    let selectionBubbleUpdateTimer = null;
    let selectionPointerSafetyTimer = null;
    let bubbleSelectedText = '';
    let bubbleSelectionPosition = null;
    let isSelectingPointer = false;

    function normalizeHostname(value) {
        if (value === null || value === undefined) return '';
        let host = String(value).trim().toLowerCase();
        if (!host) return '';
        host = host.replace(/^\*\./, '');
        if (host.includes('://')) {
            try {
                host = new URL(host).hostname.toLowerCase();
            } catch {
                host = host.split('://').pop();
            }
        }
        host = host.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
        host = host.replace(/^www\./, '');
        if (!/^[a-z0-9.-]+$/.test(host)) return '';
        return host;
    }

    function getCurrentSiteHost() {
        return normalizeHostname(windowRef.location.hostname || windowRef.location.host || '');
    }

    const currentSiteHost = getCurrentSiteHost();
    const isMobileBubbleLocked = () => windowRef.matchMedia?.('(pointer: coarse), (max-width: 640px)').matches
        || windowRef.innerWidth <= 640;
    let selectionBubbleEnabled = isMobileBubbleLocked() ? true : loadSelectionBubbleEnabled();
    let selectionBubbleBlacklist = loadBubbleBlacklist(normalizeHostname);
    if (bubbleBlacklistInput && currentSiteHost) bubbleBlacklistInput.placeholder = currentSiteHost;

    function persistBubbleBlacklist() {
        saveBubbleBlacklist(selectionBubbleBlacklist);
    }

    function persistSelectionBubbleEnabled() {
        saveSelectionBubbleEnabled(selectionBubbleEnabled);
    }

    function isCurrentSiteBlacklisted() {
        if (!currentSiteHost) return false;
        return selectionBubbleBlacklist.some(site => currentSiteHost === site || currentSiteHost.endsWith(`.${site}`));
    }

    function canShowSelectionBubble() {
        return selectionBubbleEnabled && !isCurrentSiteBlacklisted();
    }

    function getFocusSelectionRect(selection) {
        try {
            if (!selection.focusNode) return null;
            const focusRange = documentRef.createRange();
            focusRange.setStart(selection.focusNode, selection.focusOffset);
            focusRange.setEnd(selection.focusNode, selection.focusOffset);
            const focusRect = focusRange.getBoundingClientRect();
            if (focusRect && (focusRect.width || focusRect.height)) {
                return focusRect;
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    function getLastRangeClientRect(range) {
        const clientRects = range.getClientRects();
        return clientRects && clientRects.length ? clientRects[clientRects.length - 1] : null;
    }

    function isUsableSelectionRect(rect) {
        return !!(rect && (rect.width || rect.height));
    }

    function getSelectionContext() {
        let active = documentRef.activeElement;
        while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
        if (active?.closest?.('#utstShadowHost') || active?.getRootNode()?.host?.id === 'utstShadowHost') return null;
        if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && /^(text|search|url|tel)$/i.test(active.type)))) {
            const start = active.selectionStart, end = active.selectionEnd;
            if (Number.isInteger(start) && end > start) {
                const rect = active.getBoundingClientRect();
                return { text: active.value.slice(start, end), rect, position: { x: rect.left + windowRef.scrollX, y: rect.bottom + windowRef.scrollY } };
            }
        }
        if (active?.tagName === 'INPUT') return null;
        const sel = active?.getRootNode()?.getSelection?.() || windowRef.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
        const text = sel.toString().trim();
        if (!text) return null;
        const range = sel.getRangeAt(0);
        const rect = getFocusSelectionRect(sel) || getLastRangeClientRect(range) || range.getBoundingClientRect();

        if (!isUsableSelectionRect(rect)) return null;
        return {
            text,
            rect,
            position: {
                x: rect.right + windowRef.scrollX,
                y: rect.bottom + windowRef.scrollY
            }
        };
    }

    function hideBubbleCloseMenu() {
        if (!bubbleCloseMenu) return;
        bubbleCloseMenu.classList.remove('utst-open');
    }

    function hideSelectionBubble() {
        selectionBubble.classList.remove('utst-visible');
        bubbleSelectedText = '';
        bubbleSelectionPosition = null;
        hideBubbleCloseMenu();
    }

    function positionSelectionBubble(rect) {
        if (!rect) return;
        const bubbleWidth = selectionBubble.offsetWidth || 120;
        const bubbleHeight = selectionBubble.offsetHeight || 38;
        const view = getViewport(windowRef);
        const below = rect.bottom + windowRef.scrollY + 10;
        const top = below + bubbleHeight > view.top + view.height - margin ? rect.top + windowRef.scrollY - bubbleHeight - 10 : below;
        const position = clampPosition(rect.right + windowRef.scrollX - bubbleWidth / 2, top, bubbleWidth, bubbleHeight, view, margin);
        selectionBubble.style.left = `${position.left}px`;
        selectionBubble.style.top = `${position.top}px`;
    }

    function isSelectionInsideTool() {
        const sel = windowRef.getSelection();
        if (!sel) return false;
        const anchor = sel.anchorNode;
        const focus = sel.focusNode;
        const nodes = [anchor, focus].filter(Boolean);
        return nodes.some(node => {
            const el = node.nodeType === 1 ? node : node.parentElement;
            return el && (translationBox.contains(el) || fullscreenOverlay.contains(el) || selectionBubble.contains(el));
        });
    }

    function isFullscreenOpen() {
        return fullscreenOverlay && fullscreenOverlay.style.display === 'flex';
    }

    function updateSelectionBubble() {
        if (isSelectingPointer) {
            hideSelectionBubble();
            return;
        }
        if (translationBox.style.display === 'block' || isFullscreenOpen()) {
            hideSelectionBubble();
            return;
        }
        if (!canShowSelectionBubble() || isSelectionInsideTool()) {
            hideSelectionBubble();
            return;
        }
        if (selectionBubble.contains(selectionBubble.getRootNode().activeElement)) return;
        const context = getSelectionContext();
        if (!context) {
            hideSelectionBubble();
            return;
        }

        bubbleSelectedText = context.text;
        bubbleSelectionPosition = context.position;
        positionSelectionBubble(context.rect);
        selectionBubble.classList.add('utst-visible');
    }

    function scheduleSelectionBubbleUpdate(delay = 20) {
        if (isFullscreenOpen()) {
            if (selectionBubbleUpdateTimer) {
                clearTimer(selectionBubbleUpdateTimer);
                selectionBubbleUpdateTimer = null;
            }
            hideSelectionBubble();
            return;
        }
        if (selectionBubbleUpdateTimer) clearTimer(selectionBubbleUpdateTimer);
        selectionBubbleUpdateTimer = setTimer(() => {
            selectionBubbleUpdateTimer = null;
            updateSelectionBubble();
        }, delay);
    }

    function clearSelectionPointerState() {
        isSelectingPointer = false;
        if (selectionPointerSafetyTimer) {
            clearTimer(selectionPointerSafetyTimer);
            selectionPointerSafetyTimer = null;
        }
    }

    function renderBubbleBlacklist() {
        if (!bubbleBlacklistList) return;
        const { langNames } = getLanguageState();
        if (!selectionBubbleBlacklist.length) {
            bubbleBlacklistList.innerHTML = `<div class="utst-blacklist-empty">${langNames.settingsBlacklistEmpty}</div>`;
            return;
        }
        bubbleBlacklistList.innerHTML = selectionBubbleBlacklist
            .map(site => `
                <div class="utst-blacklist-item">
                    <span>${site}</span>
                    <button class="utst-blacklist-remove" type="button" data-site="${site}" title="Remove">×</button>
                </div>
            `)
            .join('');

        bubbleBlacklistList.querySelectorAll('.utst-blacklist-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const site = normalizeHostname(btn.getAttribute('data-site') || '');
                if (!site) return;
                selectionBubbleBlacklist = selectionBubbleBlacklist.filter(entry => entry !== site);
                persistBubbleBlacklist();
                renderBubbleBlacklist();
                scheduleSelectionBubbleUpdate(0);
            });
        });
    }

    function getSelectionBubbleUiLabels() {
        const { langNames, fallback } = getLanguageState();
        const bubbleLabels = (langNames && langNames.bubble) || (fallback && fallback.bubble) || {};
        return {
            hideOn: bubbleLabels.hideOn || 'Hide on',
            hideSite: bubbleLabels.hideSite || 'Hide on this site',
            hideGlobal: bubbleLabels.hideGlobal || 'Hide globally',
            closeTitle: bubbleLabels.closeTitle || 'Hide selection bubble',
            translateTitle: bubbleLabels.translateTitle || 'Translate selected text'
        };
    }

    function setButtonTitleAndAria(buttonEl, label) {
        if (!buttonEl) return;
        buttonEl.title = label;
        buttonEl.setAttribute('aria-label', label);
    }

    function syncSelectionBubbleSettingsUi() {
        const labels = getSelectionBubbleUiLabels();
        if (selectionBubbleEnabledCheckbox) {
            const mobileLocked = isMobileBubbleLocked();
            if (mobileLocked) selectionBubbleEnabled = true;
            selectionBubbleEnabledCheckbox.checked = !!selectionBubbleEnabled;
            selectionBubbleEnabledCheckbox.disabled = mobileLocked;
            selectionBubbleEnabledCheckbox.closest('.utst-toggle-row')?.classList.toggle('utst-toggle-row--locked', mobileLocked);
            if (mobileLocked) {
                selectionBubbleEnabledCheckbox.style.setProperty('background', '#6f7680', 'important');
                selectionBubbleEnabledCheckbox.style.setProperty('border-color', '#89919d', 'important');
                selectionBubbleEnabledCheckbox.style.setProperty('box-shadow', 'none', 'important');
            } else {
                selectionBubbleEnabledCheckbox.style.removeProperty('background');
                selectionBubbleEnabledCheckbox.style.removeProperty('border-color');
                selectionBubbleEnabledCheckbox.style.removeProperty('box-shadow');
            }
        }
        setButtonTitleAndAria(selectionBubbleClose, labels.closeTitle);
        setButtonTitleAndAria(selectionBubbleAction, labels.translateTitle);
        if (bubbleHideSiteButton) {
            bubbleHideSiteButton.textContent = currentSiteHost ? `${labels.hideOn} ${currentSiteHost}` : labels.hideSite;
        }
        if (bubbleHideGlobalButton) {
            bubbleHideGlobalButton.textContent = labels.hideGlobal;
        }
        renderBubbleBlacklist();
    }

    function getSelectedText() {
        return getSelectionContext()?.text || '';
    }

    function disableSelectionBubbleForCurrentSite() {
        if (!currentSiteHost) return false;
        if (!selectionBubbleBlacklist.includes(currentSiteHost)) {
            selectionBubbleBlacklist.push(currentSiteHost);
            selectionBubbleBlacklist.sort((a, b) => a.localeCompare(b));
            persistBubbleBlacklist();
        }
        hideSelectionBubble();
        syncSelectionBubbleSettingsUi();
        return true;
    }

    function bindSelectionBubbleControls() {
        if (selectionBubbleEnabledCheckbox) {
            selectionBubbleEnabledCheckbox.addEventListener('change', () => {
                if (isMobileBubbleLocked()) {
                    selectionBubbleEnabled = true;
                    syncSelectionBubbleSettingsUi();
                    return;
                }
                selectionBubbleEnabled = !!selectionBubbleEnabledCheckbox.checked;
                persistSelectionBubbleEnabled();
                hideSelectionBubble();
                scheduleSelectionBubbleUpdate(0);
            });
        }

        if (bubbleBlacklistAddButton) {
            const addBlacklistSite = () => {
                const normalized = normalizeHostname(bubbleBlacklistInput?.value || currentSiteHost);
                if (!normalized) return;
                if (!selectionBubbleBlacklist.includes(normalized)) {
                    selectionBubbleBlacklist.push(normalized);
                    selectionBubbleBlacklist.sort((a, b) => a.localeCompare(b));
                    persistBubbleBlacklist();
                    renderBubbleBlacklist();
                }
                if (bubbleBlacklistInput) bubbleBlacklistInput.value = '';
                hideSelectionBubble();
                scheduleSelectionBubbleUpdate(0);
            };

            bubbleBlacklistAddButton.addEventListener('click', addBlacklistSite);
            if (bubbleBlacklistInput) {
                bubbleBlacklistInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addBlacklistSite();
                    }
                });
            }
        }

        selectionBubble.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        const beginSelectionInteraction = (e) => {
            if (e.button !== 0) return;
            if (eventPathContains(e, selectionBubble) || eventPathContains(e, translationBox) || eventPathContains(e, fullscreenOverlay)) return;
            isSelectingPointer = true;
            hideSelectionBubble();
            // Some embedded pages swallow pointerup after a text selection.
            // Never leave the bubble permanently locked in that case.
            if (selectionPointerSafetyTimer) clearTimer(selectionPointerSafetyTimer);
            selectionPointerSafetyTimer = setTimer(() => {
                selectionPointerSafetyTimer = null;
                isSelectingPointer = false;
                scheduleSelectionBubbleUpdate(0);
            }, 480);
        };
        // Keep mouse events as a fallback: pages can proxy or suppress pointer
        // events while preserving native text selection.
        documentRef.addEventListener('pointerdown', beginSelectionInteraction, true);
        documentRef.addEventListener('mousedown', beginSelectionInteraction, true);

        if (selectionBubbleClose) {
            selectionBubbleClose.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!bubbleCloseMenu) return;
                const isOpen = bubbleCloseMenu.classList.contains('utst-open');
                bubbleCloseMenu.classList.toggle('utst-open', !isOpen);
                if (!isOpen) {
                    const view = getViewport(windowRef);
                    const rect = selectionBubble.getBoundingClientRect();
                    bubbleCloseMenu.style.left = `${Math.max(view.left + margin - rect.left - windowRef.scrollX, Math.min(0, view.left + view.width - margin - rect.left - windowRef.scrollX - bubbleCloseMenu.offsetWidth))}px`;
                    bubbleCloseMenu.style.right = 'auto';
                    bubbleCloseMenu.style.top = rect.bottom + bubbleCloseMenu.offsetHeight + 8 > (windowRef.visualViewport?.offsetTop || 0) + view.height ? 'auto' : 'calc(100% + 8px)';
                    bubbleCloseMenu.style.bottom = bubbleCloseMenu.style.top === 'auto' ? 'calc(100% + 8px)' : 'auto';
                }
            });
        }


        if (bubbleHideSiteButton) {
            bubbleHideSiteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                disableSelectionBubbleForCurrentSite();
                scheduleSelectionBubbleUpdate(0);
            });
        }

        if (bubbleHideGlobalButton) {
            bubbleHideGlobalButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isMobileBubbleLocked()) {
                    hideSelectionBubble();
                    return;
                }
                selectionBubbleEnabled = false;
                persistSelectionBubbleEnabled();
                syncSelectionBubbleSettingsUi();
                hideSelectionBubble();
            });
        }

        if (selectionBubbleAction) {
            selectionBubbleAction.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = (bubbleSelectedText || getSelectedText() || '').trim();
                const pos = bubbleSelectionPosition
                    ? { x: bubbleSelectionPosition.x, y: bubbleSelectionPosition.y }
                    : null;
                onTranslateSelection(text, pos);
            });
        }
    }

    function bindSelectionEvents({ onBeforeMouseUp }) {
        documentRef.addEventListener('selectionchange', () => {
            if (isSelectingPointer) {
                hideSelectionBubble();
                return;
            }
            scheduleSelectionBubbleUpdate();
        });
        const finishSelectionInteraction = () => {
            if (!isSelectingPointer && !selectionPointerSafetyTimer) return;
            onBeforeMouseUp();
            clearSelectionPointerState();
            scheduleSelectionBubbleUpdate(180);
        };
        documentRef.addEventListener('pointerup', finishSelectionInteraction, true);
        documentRef.addEventListener('mouseup', finishSelectionInteraction, true);
        documentRef.addEventListener('pointercancel', () => { clearSelectionPointerState(); scheduleSelectionBubbleUpdate(180); }, true);
        windowRef.addEventListener('blur', () => { clearSelectionPointerState(); hideSelectionBubble(); });
        documentRef.addEventListener('keyup', () => {
            scheduleSelectionBubbleUpdate();
        });
    }

    return {
        bindSelectionBubbleControls,
        bindSelectionEvents,
        disableSelectionBubbleForCurrentSite,
        getSelectionContext,
        hideBubbleCloseMenu,
        hideSelectionBubble,
        isFullscreenOpen,
        scheduleSelectionBubbleUpdate,
        syncSelectionBubbleSettingsUi
    };
}
