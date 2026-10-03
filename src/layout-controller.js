import { getViewport, clampPosition } from './viewport.js';
import { loadSidePanelWidth, saveSidePanelWidth } from './storage.js';
export function createLayoutController({
    windowRef,
    documentRef,
    translationBox,
    dragHandle,
    fullscreenOverlay,
    fullscreenSource,
    fullscreenTarget,
    fullscreenSourceWrap,
    fullscreenTargetWrap,
    requestFrame,
    cancelFrame
}) {
    const BOX_W = 420;
    const BOX_H = 260;
    const MARGIN = 10;

    let isDragging = false;
    let dragStartMouseX = 0;
    let dragStartMouseY = 0;
    let dragStartLeft = 0;
    let dragStartTop = 0;
    let previousUserSelect = '';

    let fullscreenTextareaResizePending = false;
    let fullscreenTextareaResizeStartHeight = 0;
    let fullscreenTextareaResizeActive = null;
    let fullscreenTextareaResizeRaf = 0;
    let fullscreenTextareaLastSyncedHeight = 0;

    let fullscreenScrollLocked = false;
    let fullscreenScrollTop = 0;
    let prevHtmlOverflow = '';
    let prevHtmlOverscrollBehavior = '';
    let prevBodyOverflow = '';
    let prevBodyPosition = '';
    let prevBodyTop = '';
    let prevBodyLeft = '';
    let prevBodyWidth = '';
    let prevBodyOverscrollBehavior = '';
    let prevBodyTouchAction = '';
    let prevBodyPaddingRight = '';
    let prevBodyBoxSizing = '';
    let sidePanelMode = false;
    let preferredSidePanelWidth = loadSidePanelWidth();
    let popupOverflowSnapshot = null;
    let popupPositionBeforeFullscreen = null;
    let mobileViewportWidth = 0;
    let mobileViewportHeight = 0;

    function isMobilePopupViewport() {
        return windowRef.matchMedia?.('(pointer: coarse) and (hover: none)').matches;
    }

    function isSidePanelViewport() {
        return !isMobilePopupViewport() && windowRef.innerWidth >= 700;
    }

    function isMobileKeyboardOpen(viewport) {
        if (!isMobilePopupViewport()) return false;
        const width = Math.round(viewport.width);
        const height = Math.round(viewport.height);
        if (!mobileViewportWidth || Math.abs(width - mobileViewportWidth) > 40) {
            mobileViewportWidth = width;
            mobileViewportHeight = height;
            return false;
        }
        mobileViewportHeight = Math.max(mobileViewportHeight, height);
        return mobileViewportHeight - height >= 120;
    }

    function getSidePanelWidth() {
        const maxWidth = Math.max(340, Math.min(760, windowRef.innerWidth - 280));
        return Math.round(Math.min(maxWidth, Math.max(340, preferredSidePanelWidth)));
    }

    function applySidePanelWidth() {
        const width = getSidePanelWidth();
        fullscreenOverlay.style.setProperty('--utst-side-panel-width', `${width}px`);
        if (sidePanelMode) documentRef.body.style.paddingRight = `${width}px`;
        return width;
    }

    function setSidePanelWidth(width, { persist = true } = {}) {
        const numericWidth = Number(width);
        if (!Number.isFinite(numericWidth)) return applySidePanelWidth();
        const maxWidth = Math.max(340, Math.min(760, windowRef.innerWidth - 280));
        const nextWidth = Math.round(Math.min(maxWidth, Math.max(340, numericWidth)));
        const widthChanged = preferredSidePanelWidth !== nextWidth;
        preferredSidePanelWidth = nextWidth;
        if (persist) saveSidePanelWidth(preferredSidePanelWidth);
        return widthChanged ? applySidePanelWidth() : preferredSidePanelWidth;
    }

    function setStyleProperty(el, property, value, priority = '') {
        if (!el) return;
        if (value) el.style.setProperty(property, value, priority);
        else el.style.removeProperty(property);
    }

    function enablePopupOverflowForZoom() {
        if (popupOverflowSnapshot) return;
        const elements = [documentRef.documentElement, documentRef.body].filter(Boolean);
        popupOverflowSnapshot = elements.map(element => ({
            element,
            overflowX: element.style.getPropertyValue('overflow-x'),
            overflowXPriority: element.style.getPropertyPriority('overflow-x'),
            overflowY: element.style.getPropertyValue('overflow-y'),
            overflowYPriority: element.style.getPropertyPriority('overflow-y')
        }));
        elements.forEach(element => {
            element.style.setProperty('overflow-x', 'auto', 'important');
            element.style.setProperty('overflow-y', 'auto', 'important');
        });
    }

    function restorePopupOverflow() {
        if (!popupOverflowSnapshot) return;
        popupOverflowSnapshot.forEach(({ element, overflowX, overflowXPriority, overflowY, overflowYPriority }) => {
            setStyleProperty(element, 'overflow-x', overflowX, overflowXPriority);
            setStyleProperty(element, 'overflow-y', overflowY, overflowYPriority);
        });
        popupOverflowSnapshot = null;
    }

    function clampBoxPosition(left, top) {
        const width = translationBox.offsetWidth || BOX_W;
        const height = translationBox.offsetHeight || BOX_H;
        return clampPosition(left, top, width, height, getViewport(windowRef), MARGIN);
    }

    function placeBoxAtSelection(fallbackPosition) {
        const view = getViewport(windowRef);
        if (isMobilePopupViewport()) {
            const position = clampBoxPosition(view.left + MARGIN, view.top + MARGIN);
            translationBox.style.left = `${position.left}px`;
            translationBox.style.top = `${position.top}px`;
            return;
        }
        let x = fallbackPosition?.x ?? view.left + MARGIN;
        let y = fallbackPosition?.y ?? view.top + MARGIN;
        if (!fallbackPosition) {
            const selection = windowRef.getSelection();
            if (selection?.rangeCount && !selection.isCollapsed) {
                const rect = selection.getRangeAt(0).getBoundingClientRect();
                x = rect.left + windowRef.scrollX;
                y = rect.bottom + windowRef.scrollY;
            }
        }
        const position = clampBoxPosition(x, y + MARGIN);
        translationBox.style.left = `${position.left}px`;
        translationBox.style.top = `${position.top}px`;
    }

    let viewportFrame = 0;
    function syncViewport() {
        if (viewportFrame) return;
        viewportFrame = requestFrame(() => {
            viewportFrame = 0;
            const visualScale = windowRef.visualViewport?.scale || 1;
            const isVisualZoomed = Math.abs(visualScale - 1) > 0.001;
            if (isVisualZoomed) {
                if (translationBox.style.display === 'block') enablePopupOverflowForZoom();
                return;
            }
            const view = getViewport(windowRef);
            const host = translationBox.getRootNode().host || translationBox.parentElement;
            host.style.setProperty('--utst-vw', `${view.width}px`);
            host.style.setProperty('--utst-vh', `${view.height}px`);
            translationBox.classList.toggle('utst-mobile-keyboard-open', isMobileKeyboardOpen(view));
            const visualViewport = windowRef.visualViewport;
            fullscreenOverlay.style.setProperty('top', `${visualViewport?.offsetTop || 0}px`, 'important');
            fullscreenOverlay.style.setProperty('left', `${visualViewport?.offsetLeft || 0}px`, 'important');
            fullscreenOverlay.style.setProperty('right', 'auto', 'important');
            fullscreenOverlay.style.setProperty('bottom', 'auto', 'important');
            fullscreenOverlay.style.setProperty('width', `${view.width}px`, 'important');
            fullscreenOverlay.style.setProperty('height', `${view.height}px`, 'important');
            if (sidePanelMode) applySidePanelWidth();
            if (fullscreenScrollLocked) return;
            if (translationBox.style.display === 'block' && isMobilePopupViewport()) {
                const position = clampBoxPosition(view.left + MARGIN, view.top + MARGIN);
                translationBox.style.left = `${position.left}px`;
                translationBox.style.top = `${position.top}px`;
            } else if (translationBox.style.display === 'block') {
                const position = clampBoxPosition(parseFloat(translationBox.style.left) || view.left, parseFloat(translationBox.style.top) || view.top);
                translationBox.style.left = `${position.left}px`;
                translationBox.style.top = `${position.top}px`;
            }
        });
    }
    windowRef.visualViewport?.addEventListener('resize', syncViewport, { passive: true });
    windowRef.visualViewport?.addEventListener('scroll', syncViewport, { passive: true });
    windowRef.addEventListener('resize', syncViewport, { passive: true });
    windowRef.addEventListener('scroll', syncViewport, { passive: true });
    syncViewport();

    function getFullscreenTextareaBounds() {
        const minHeight = Math.min(200, Math.max(80, Math.floor(getViewport(windowRef).height * 0.3)));
        const maxByViewport = Math.floor(windowRef.innerHeight * 0.62);
        const maxHeight = Math.max(minHeight, Math.min(560, maxByViewport));
        return { minHeight, maxHeight };
    }

    function syncFullscreenTextareaHeights(preferredHeight = null) {
        if (!fullscreenSource || !fullscreenTarget) return;
        if (windowRef.matchMedia('(max-width: 640px), (pointer: coarse) and (max-height: 500px)').matches) {
            [fullscreenSource, fullscreenTarget, fullscreenSourceWrap, fullscreenTargetWrap].filter(Boolean).forEach(element => {
                ['height', 'min-height', 'max-height'].forEach(property => element.style.removeProperty(property));
            });
            return;
        }
        const { minHeight, maxHeight } = getFullscreenTextareaBounds();
        const sourceHeight = Math.round(fullscreenSource.getBoundingClientRect().height || minHeight);
        const targetHeight = Math.round(fullscreenTarget.getBoundingClientRect().height || minHeight);
        const rawHeight = Number.isFinite(preferredHeight) && preferredHeight > 0
            ? preferredHeight
            : Math.max(sourceHeight, targetHeight, minHeight);
        const clampedHeight = Math.max(minHeight, Math.min(maxHeight, Math.round(rawHeight)));

        fullscreenSource.style.minHeight = `${minHeight}px`;
        fullscreenTarget.style.minHeight = `${minHeight}px`;
        fullscreenSource.style.maxHeight = `${maxHeight}px`;
        fullscreenTarget.style.maxHeight = `${maxHeight}px`;
        fullscreenSource.style.height = `${clampedHeight}px`;
        fullscreenTarget.style.height = `${clampedHeight}px`;
        if (fullscreenSourceWrap) {
            fullscreenSourceWrap.style.height = `${clampedHeight}px`;
            fullscreenSourceWrap.style.minHeight = `${minHeight}px`;
            fullscreenSourceWrap.style.maxHeight = `${maxHeight}px`;
        }
        if (fullscreenTargetWrap) {
            fullscreenTargetWrap.style.height = `${clampedHeight}px`;
            fullscreenTargetWrap.style.minHeight = `${minHeight}px`;
            fullscreenTargetWrap.style.maxHeight = `${maxHeight}px`;
        }
    }

    function markFullscreenResizeStart(e) {
        if (!e || !e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect || !rect.height) return;
        const resizeZone = 18;
        const isNearBottom = (rect.bottom - e.clientY) <= resizeZone;
        if (!isNearBottom) return;
        fullscreenTextareaResizePending = true;
        fullscreenTextareaResizeActive = e.currentTarget;
        fullscreenTextareaResizeStartHeight = Math.round(rect.height);
        fullscreenTextareaLastSyncedHeight = fullscreenTextareaResizeStartHeight;
    }

    function finishFullscreenTextareaResize() {
        if (!fullscreenTextareaResizePending) return;
        fullscreenTextareaResizePending = false;
        if (fullscreenOverlay.style.display === 'flex' && fullscreenTextareaResizeActive) {
            const endHeight = Math.round(fullscreenTextareaResizeActive.getBoundingClientRect().height || 0);
            if (Math.abs(endHeight - fullscreenTextareaResizeStartHeight) >= 1) {
                syncFullscreenTextareaHeights(endHeight);
            }
        }
        fullscreenTextareaResizeActive = null;
        fullscreenTextareaResizeStartHeight = 0;
        fullscreenTextareaLastSyncedHeight = 0;
        if (fullscreenTextareaResizeRaf) {
            cancelFrame(fullscreenTextareaResizeRaf);
            fullscreenTextareaResizeRaf = 0;
        }
    }

    function resetFullscreenTextareaResize() {
        fullscreenTextareaResizePending = false;
        fullscreenTextareaResizeActive = null;
        fullscreenTextareaResizeStartHeight = 0;
        fullscreenTextareaLastSyncedHeight = 0;
        if (fullscreenTextareaResizeRaf) {
            cancelFrame(fullscreenTextareaResizeRaf);
            fullscreenTextareaResizeRaf = 0;
        }
    }

    function lockPageScrollForFullscreen() {
        if (fullscreenScrollLocked) return;
        popupPositionBeforeFullscreen = translationBox.style.display === 'block'
            ? { left: translationBox.style.left, top: translationBox.style.top }
            : null;
        const scrollY = windowRef.scrollY || windowRef.pageYOffset || 0;
        fullscreenScrollTop = scrollY;

        sidePanelMode = isSidePanelViewport();
        if (sidePanelMode) {
            prevBodyPaddingRight = documentRef.body.style.paddingRight;
            prevBodyBoxSizing = documentRef.body.style.boxSizing;
            documentRef.body.style.boxSizing = 'border-box';
            applySidePanelWidth();
            fullscreenScrollLocked = true;
            return;
        }

        prevHtmlOverflow = documentRef.documentElement.style.overflow;
        prevHtmlOverscrollBehavior = documentRef.documentElement.style.overscrollBehavior;
        prevBodyOverflow = documentRef.body.style.overflow;
        prevBodyPosition = documentRef.body.style.position;
        prevBodyTop = documentRef.body.style.top;
        prevBodyLeft = documentRef.body.style.left;
        prevBodyWidth = documentRef.body.style.width;
        prevBodyOverscrollBehavior = documentRef.body.style.overscrollBehavior;
        prevBodyTouchAction = documentRef.body.style.touchAction;

        documentRef.documentElement.style.overflow = 'hidden';
        documentRef.documentElement.style.overscrollBehavior = 'none';
        documentRef.body.style.overflow = 'hidden';
        documentRef.body.style.position = 'fixed';
        documentRef.body.style.top = `-${scrollY}px`;
        documentRef.body.style.left = '0';
        documentRef.body.style.width = '100%';
        documentRef.body.style.overscrollBehavior = 'none';
        documentRef.body.style.touchAction = 'none';
        fullscreenScrollLocked = true;
    }

    function unlockPageScrollForFullscreen() {
        if (!fullscreenScrollLocked) return;
        if (sidePanelMode) {
            documentRef.body.style.paddingRight = prevBodyPaddingRight;
            documentRef.body.style.boxSizing = prevBodyBoxSizing;
            fullscreenScrollLocked = false;
            sidePanelMode = false;
            return;
        }
        documentRef.documentElement.style.overflow = prevHtmlOverflow;
        documentRef.documentElement.style.overscrollBehavior = prevHtmlOverscrollBehavior;
        documentRef.body.style.overflow = prevBodyOverflow;
        documentRef.body.style.position = prevBodyPosition;
        documentRef.body.style.top = prevBodyTop;
        documentRef.body.style.left = prevBodyLeft;
        documentRef.body.style.width = prevBodyWidth;
        documentRef.body.style.overscrollBehavior = prevBodyOverscrollBehavior;
        documentRef.body.style.touchAction = prevBodyTouchAction;
        windowRef.scrollTo(0, fullscreenScrollTop);
        fullscreenScrollLocked = false;
        const savedPopupPosition = popupPositionBeforeFullscreen;
        const restorePopupPosition = () => {
            if (!savedPopupPosition || translationBox.style.display !== 'block') return;
            translationBox.style.left = savedPopupPosition.left;
            translationBox.style.top = savedPopupPosition.top;
        };
        restorePopupPosition();
        requestFrame(restorePopupPosition);
        popupPositionBeforeFullscreen = null;
    }

    let lastViewportWidth = windowRef.innerWidth;
    windowRef.addEventListener('resize', () => {
        const currentWidth = windowRef.innerWidth;
        if (currentWidth !== lastViewportWidth) {
            lastViewportWidth = currentWidth;
            syncViewport();
            if (sidePanelMode) applySidePanelWidth();
        }
    });

    if (dragHandle) {
        dragHandle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            dragHandle.setPointerCapture?.(e.pointerId);
            isDragging = true;
            const rect = translationBox.getBoundingClientRect();
            const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
            const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
            dragStartMouseX = e.clientX;
            dragStartMouseY = e.clientY;
            dragStartLeft = parseFloat(translationBox.style.left) || rect.left + scrollX;
            dragStartTop = parseFloat(translationBox.style.top) || rect.top + scrollY;
            previousUserSelect = documentRef.body.style.userSelect;
            documentRef.body.style.userSelect = 'none';
        });
    }

    documentRef.addEventListener('pointermove', (e) => {
        if (fullscreenTextareaResizePending && fullscreenOverlay.style.display === 'flex' && fullscreenTextareaResizeActive) {
            if (!fullscreenTextareaResizeRaf) {
                fullscreenTextareaResizeRaf = requestFrame(() => {
                    fullscreenTextareaResizeRaf = 0;
                    if (!fullscreenTextareaResizePending || !fullscreenTextareaResizeActive) return;
                    const liveHeight = Math.round(fullscreenTextareaResizeActive.getBoundingClientRect().height || 0);
                    if (liveHeight > 0 && Math.abs(liveHeight - fullscreenTextareaLastSyncedHeight) >= 1) {
                        syncFullscreenTextareaHeights(liveHeight);
                        fullscreenTextareaLastSyncedHeight = liveHeight;
                    }
                });
            }
        }

        if (!isDragging) return;
        const newLeft = dragStartLeft + (e.clientX - dragStartMouseX);
        const newTop = dragStartTop + (e.clientY - dragStartMouseY);
        const { left, top } = clampBoxPosition(newLeft, newTop);
        translationBox.style.left = `${left}px`;
        translationBox.style.top = `${top}px`;
    });

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        documentRef.body.style.userSelect = previousUserSelect;
    };
    documentRef.addEventListener('pointerup', endDrag);
    documentRef.addEventListener('pointercancel', endDrag);
    windowRef.addEventListener('blur', endDrag);

    return {
        MARGIN,
        enablePopupOverflowForZoom,
        finishFullscreenTextareaResize,
        lockPageScrollForFullscreen,
        isSidePanelViewport,
        getSidePanelWidth,
        setSidePanelWidth,
        markFullscreenResizeStart,
        placeBoxAtSelection,
        resetFullscreenTextareaResize,
        restorePopupOverflow,
        syncFullscreenTextareaHeights,
        unlockPageScrollForFullscreen
    };
}
