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
    let bubbleSelectedText = '';
    let bubbleSelectionPosition = null;
    let isSelectingPointer = false;

    function normalizeHostname(value) {
        if (value == null) return '';
        let host = String(value).trim().toLowerCase();
        if (!host) return '';
        host = host.replace(/^\*\./, '');
        if (host.includes('://')) {
            try {
                host = new URL(host).hostname.toLowerCase();
            } catch (e) {
                host = host.split('://').pop();
            }
        }
        host = host.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
        host = host.replace(/^www\./, '');
        return host;
    }

    function getCurrentSiteHost() {
        return normalizeHostname(windowRef.location.hostname || windowRef.location.host || '');
    }

    const currentSiteHost = getCurrentSiteHost();
    let selectionBubbleEnabled = loadSelectionBubbleEnabled();
    let selectionBubbleBlacklist = loadBubbleBlacklist(normalizeHostname);

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
        const sel = windowRef.getSelection();
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
        const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
        const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
        const minLeft = scrollX + margin;
        const maxLeft = scrollX + windowRef.innerWidth - bubbleWidth - margin;
        const belowTop = rect.bottom + scrollY + 8;
        const aboveTop = rect.top + scrollY - bubbleHeight - 8;
        const maxTop = scrollY + windowRef.innerHeight - bubbleHeight - margin;
        const minTop = scrollY + margin;
        const anchorLeft = rect.right + scrollX - (bubbleWidth / 2);

        let top = belowTop;
        if (top > maxTop) {
            top = Math.max(minTop, aboveTop);
        }

        const left = Math.min(Math.max(anchorLeft, minLeft), maxLeft);
        selectionBubble.style.left = `${left}px`;
        selectionBubble.style.top = `${Math.min(Math.max(top, minTop), maxTop)}px`;
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
            selectionBubbleEnabledCheckbox.checked = !!selectionBubbleEnabled;
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
        return windowRef.getSelection().toString().trim();
    }

    function bindSelectionBubbleControls() {
        if (selectionBubbleEnabledCheckbox) {
            selectionBubbleEnabledCheckbox.addEventListener('change', () => {
                selectionBubbleEnabled = !!selectionBubbleEnabledCheckbox.checked;
                persistSelectionBubbleEnabled();
                hideSelectionBubble();
                scheduleSelectionBubbleUpdate(0);
            });
        }

        if (bubbleBlacklistAddButton) {
            const addBlacklistSite = () => {
                const normalized = normalizeHostname(bubbleBlacklistInput ? bubbleBlacklistInput.value : '');
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

        documentRef.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (eventPathContains(e, selectionBubble) || eventPathContains(e, translationBox) || eventPathContains(e, fullscreenOverlay)) return;
            isSelectingPointer = true;
            hideSelectionBubble();
        }, true);

        if (selectionBubbleClose) {
            selectionBubbleClose.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!bubbleCloseMenu) return;
                const isOpen = bubbleCloseMenu.classList.contains('utst-open');
                bubbleCloseMenu.classList.toggle('utst-open', !isOpen);
            });
        }

        if (bubbleHideSiteButton) {
            bubbleHideSiteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentSiteHost && !selectionBubbleBlacklist.includes(currentSiteHost)) {
                    selectionBubbleBlacklist.push(currentSiteHost);
                    selectionBubbleBlacklist.sort((a, b) => a.localeCompare(b));
                    persistBubbleBlacklist();
                }
                hideSelectionBubble();
                syncSelectionBubbleSettingsUi();
                scheduleSelectionBubbleUpdate(0);
            });
        }

        if (bubbleHideGlobalButton) {
            bubbleHideGlobalButton.addEventListener('click', (e) => {
                e.stopPropagation();
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
        documentRef.addEventListener('mouseup', () => {
            onBeforeMouseUp();
            isSelectingPointer = false;
            scheduleSelectionBubbleUpdate();
        }, true);
        documentRef.addEventListener('keyup', () => {
            scheduleSelectionBubbleUpdate();
        });
    }

    return {
        bindSelectionBubbleControls,
        bindSelectionEvents,
        getSelectionContext,
        hideBubbleCloseMenu,
        hideSelectionBubble,
        isFullscreenOpen,
        scheduleSelectionBubbleUpdate,
        syncSelectionBubbleSettingsUi
    };
}
