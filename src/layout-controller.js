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

    function clampBoxPosition(left, top) {
        const width = translationBox.offsetWidth || BOX_W;
        const height = translationBox.offsetHeight || BOX_H;
        const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
        const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;
        const minLeft = scrollX + MARGIN;
        const maxLeft = scrollX + windowRef.innerWidth - width - MARGIN;
        const minTop = scrollY + MARGIN;
        const maxTop = scrollY + windowRef.innerHeight - height - MARGIN;
        return {
            left: Math.min(Math.max(minLeft, left), maxLeft),
            top: Math.min(Math.max(minTop, top), maxTop)
        };
    }

    function placeBoxAtSelection(fallbackPosition) {
        const sel = windowRef.getSelection();
        if (!sel || !sel.rangeCount) {
            if (fallbackPosition && Number.isFinite(fallbackPosition.x) && Number.isFinite(fallbackPosition.y)) {
                const { left, top } = clampBoxPosition(fallbackPosition.x, fallbackPosition.y + MARGIN);
                translationBox.style.left = `${left}px`;
                translationBox.style.top = `${top}px`;
            }
            return;
        }

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const scrollX = windowRef.scrollX || documentRef.documentElement.scrollLeft || 0;
        const scrollY = windowRef.scrollY || documentRef.documentElement.scrollTop || 0;

        let left = rect.left + scrollX;
        const topBelow = rect.bottom + scrollY + MARGIN;
        const topAbove = rect.top + scrollY - BOX_H - MARGIN;

        const vpLeft = scrollX + MARGIN;
        const vpRight = scrollX + windowRef.innerWidth - MARGIN;
        const vpBottom = scrollY + windowRef.innerHeight - MARGIN;

        if (left + BOX_W > vpRight) left = vpRight - BOX_W;
        if (left < vpLeft) left = vpLeft;

        let top;
        if (topBelow + BOX_H <= vpBottom) {
            top = topBelow;
        } else {
            top = Math.max(topAbove, scrollY + MARGIN);
        }

        translationBox.style.left = `${left}px`;
        translationBox.style.top = `${top}px`;
    }

    function getFullscreenTextareaBounds() {
        const minHeight = 200;
        const maxByViewport = Math.floor(windowRef.innerHeight * 0.62);
        const maxHeight = Math.max(minHeight, Math.min(560, maxByViewport));
        return { minHeight, maxHeight };
    }

    function syncFullscreenTextareaHeights(preferredHeight = null) {
        if (!fullscreenSource || !fullscreenTarget) return;
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
        const scrollY = windowRef.scrollY || windowRef.pageYOffset || 0;
        fullscreenScrollTop = scrollY;

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
    }

    windowRef.addEventListener('resize', () => {
        if (translationBox.style.display === 'block') placeBoxAtSelection();
    });

    if (dragHandle) {
        dragHandle.addEventListener('mousedown', (e) => {
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

    documentRef.addEventListener('mousemove', (e) => {
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

    documentRef.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        documentRef.body.style.userSelect = previousUserSelect;
    });

    return {
        MARGIN,
        finishFullscreenTextareaResize,
        lockPageScrollForFullscreen,
        markFullscreenResizeStart,
        placeBoxAtSelection,
        resetFullscreenTextareaResize,
        syncFullscreenTextareaHeights,
        unlockPageScrollForFullscreen
    };
}
