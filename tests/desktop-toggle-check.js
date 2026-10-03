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

    if (await page.locator('#panelSourceSection').isVisible()) throw Error('Mobile source section is visible on desktop');
    if (!await page.locator('#fullscreenToggle').isVisible()) throw Error('Fullscreen action is missing on desktop');

    await page.locator('#panelSwap').click();
    await page.waitForTimeout(180);
    if (await page.locator('#sourceLang').inputValue() !== 'fr' || await page.locator('#targetLang').inputValue() !== 'en') {
        throw Error('Desktop popup swap failed');
    }

    await page.locator('#sourceLangTrigger').click();
    if (!await page.locator('#sourceLangMenu').isVisible()) throw Error('Desktop language menu did not open');
    await page.locator('#sourceLangTrigger').click();
    if (await page.locator('#sourceLangMenu').isVisible()) throw Error('Desktop language menu did not close on second click');

    await page.locator('#settingsButton').click();
    if (!await page.locator('#settingsPanel').isVisible()) throw Error('Desktop settings did not open');
    if (!await page.locator('#shortcutCaptureLabel').isVisible()) throw Error('Keyboard shortcut is missing on desktop');
    await page.locator('#settingsButton').click();
    if (await page.locator('#settingsPanel').isVisible()) throw Error('Desktop settings did not close on second click');

    return { popupSwap: true, menusToggle: true, settingsToggle: true, shortcutVisible: true, fullscreenVisible: true };
}
