async (page) => {
    const browser = page.context().browser();
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3
    });
    const mobile = await mobileContext.newPage();
    await mobile.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
    await mobile.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await mobile.waitForTimeout(180);
    await mobile.locator('#utstSelectionBubbleAction').tap();
    await mobile.waitForTimeout(180);

    await mobile.evaluate(() => window.scrollTo(0, 360));
    await mobile.waitForTimeout(100);
    const popupY = (await mobile.locator('#utstTranslationBox').boundingBox()).y;
    if (Math.abs(popupY - 10) > 2) throw Error(`Mobile popup is not pinned to the viewport top: ${popupY}`);

    await mobile.locator('#settingsButton').tap();
    const bubbleToggle = mobile.locator('#selectionBubbleEnabled');
    if (!await bubbleToggle.isChecked() || !await bubbleToggle.isDisabled()) {
        throw Error('The mobile bubble toggle is not checked and locked');
    }
    const toggleBackground = await bubbleToggle.evaluate(element => getComputedStyle(element).backgroundColor);
    if (!toggleBackground.includes('111') && !toggleBackground.includes('112')) {
        throw Error(`The locked toggle is not grey: ${toggleBackground}`);
    }

    const languageTrigger = mobile.locator('#defaultTranslateLangTrigger');
    await languageTrigger.scrollIntoViewIfNeeded();
    await languageTrigger.tap();
    if (!await mobile.locator('#defaultTranslateLangMenu').isVisible()) throw Error('Settings language menu did not open');
    await mobile.locator('#settingsPanel').evaluate(element => {
        element.scrollTop += 40;
        element.dispatchEvent(new Event('scroll'));
    });
    await mobile.waitForTimeout(50);
    if (await mobile.locator('#defaultTranslateLangMenu').isVisible()) throw Error('Settings scroll did not close the language menu');

    const themeTrigger = mobile.locator('#panelThemeTrigger');
    await themeTrigger.scrollIntoViewIfNeeded();
    await themeTrigger.tap();
    if (!await mobile.locator('#panelThemePanel').isVisible()) throw Error('Theme menu did not open');
    await mobile.locator('#settingsPanel').evaluate(element => {
        element.scrollTop += 40;
        element.dispatchEvent(new Event('scroll'));
    });
    await mobile.waitForTimeout(50);
    if (await mobile.locator('#panelThemePanel').isVisible()) throw Error('Settings scroll did not close the theme menu');
    await mobileContext.close();

    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktop = await desktopContext.newPage();
    await desktop.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
    await desktop.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await desktop.waitForTimeout(180);
    await desktop.locator('#utstSelectionBubbleAction').click();
    await desktop.waitForTimeout(180);
    const popupBeforeFullscreen = await desktop.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    await desktop.locator('#fullscreenToggle').click();
    await desktop.waitForTimeout(80);
    await desktop.locator('#fullscreenClose').click();
    await desktop.waitForTimeout(120);
    const popupAfterFullscreen = await desktop.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    await desktopContext.close();
    if (popupBeforeFullscreen.left !== popupAfterFullscreen.left || popupBeforeFullscreen.top !== popupAfterFullscreen.top) {
        throw Error(`Fullscreen moved the popup: ${JSON.stringify({ popupBeforeFullscreen, popupAfterFullscreen })}`);
    }
    return { mobileBubbleLocked: true, popupPinnedTop: true, settingsScrollClosesMenus: true, fullscreenPositionStable: true };
}
