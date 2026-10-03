async (page) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.waitForTimeout(220);
    await page.locator('#utstSelectionBubbleAction').click();
    await page.waitForTimeout(180);
    await page.locator('#fullscreenToggle').click();
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async () => {} }
    }));
    await page.locator('#fullscreenSourceCopy').click();
    if (!await page.locator('#fullscreenSourceCopy .utst-copy-check').count()) throw Error('Fullscreen source copy does not show a check');
    await page.locator('#fullscreenTargetCopy').click();
    if (!await page.locator('#fullscreenTargetCopy .utst-copy-check').count()) throw Error('Fullscreen translation copy does not show a check');
    return { allCopyActionsShowChecks: true };
}
