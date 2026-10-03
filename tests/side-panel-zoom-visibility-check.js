async (page) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?side-panel-zoom=1');
    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.locator('#utstSelectionBubbleAction').click();
    await page.locator('#fullscreenToggle').click();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 });
    await page.waitForTimeout(180);
    const duringZoom = await page.locator('#fullscreenOverlay').evaluate(element => ({
        display: getComputedStyle(element).display,
        panelWidth: Math.round(element.querySelector('#fullscreenPanel').getBoundingClientRect().width)
    }));
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    await page.waitForTimeout(180);
    const afterZoom = await page.locator('#fullscreenOverlay').evaluate(element => ({
        display: getComputedStyle(element).display,
        panelWidth: Math.round(element.querySelector('#fullscreenPanel').getBoundingClientRect().width)
    }));
    if (duringZoom.display !== 'flex' || afterZoom.display !== 'flex' || !duringZoom.panelWidth || !afterZoom.panelWidth) {
        throw Error(`Side panel became invisible around zoom: ${JSON.stringify({ duringZoom, afterZoom })}`);
    }
    await page.locator('#fullscreenClose').click();
    return { visibleDuringZoom: true, visibleAfterZoom: true };
}
