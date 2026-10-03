export function getViewport(win) {
    const view = win.visualViewport;
    const isVisualZoomed = view && Math.abs((view.scale || 1) - 1) > 0.001;
    if (isVisualZoomed) {
        return {
            left: win.scrollX || 0,
            top: win.scrollY || 0,
            width: win.innerWidth,
            height: win.innerHeight
        };
    }
    return { left: (win.scrollX || 0) + (view?.offsetLeft || 0), top: (win.scrollY || 0) + (view?.offsetTop || 0),
        width: Math.min(view?.width || win.innerWidth, win.document?.documentElement.clientWidth || win.innerWidth),
        height: Math.min(view?.height || win.innerHeight, win.document?.documentElement.clientHeight || win.innerHeight) };
}
export function clampPosition(left, top, width, height, viewport, margin = 10) {
    return { left: Math.max(viewport.left + margin, Math.min(left, viewport.left + viewport.width - width - margin)),
        top: Math.max(viewport.top + margin, Math.min(top, viewport.top + viewport.height - height - margin)) };
}
export function positionMenu(panel, anchor, win) {
    const view = getViewport(win), rect = anchor.getBoundingClientRect();
    panel.style.maxWidth = `${Math.max(0, view.width - 20)}px`;
    panel.style.maxHeight = `${Math.max(0, view.height - 20)}px`;
    panel.style.overflowY = 'auto';
    const height = panel.offsetHeight;
    const below = rect.bottom + win.scrollY + 4;
    const top = below + height > view.top + view.height - 10 ? rect.top + win.scrollY - height - 4 : below;
    const position = clampPosition(rect.left + win.scrollX, top, panel.offsetWidth, height, view);
    panel.style.left = `${position.left}px`;
    panel.style.top = `${position.top}px`;
}
