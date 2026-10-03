async (page) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.waitForTimeout(180);
    await page.locator('#utstSelectionBubbleAction').click();
    await page.waitForTimeout(180);
    await page.locator('#settingsButton').click();

    const controlMetrics = await Promise.all([
        '#defaultTranslateLang',
        '#toolLanguage',
        '#panelThemeTrigger'
    ].map(selector => page.locator(selector).evaluate(element => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height, radius: style.borderRadius };
    })));
    const [defaultLanguage, toolLanguage, theme] = controlMetrics;
    if (!controlMetrics.every(control => Math.abs(control.width - defaultLanguage.width) < 1
        && control.height === defaultLanguage.height && control.radius === defaultLanguage.radius)) {
        throw Error(`Settings controls are not uniform: ${JSON.stringify(controlMetrics)}`);
    }

    await page.locator('#panelThemeTrigger').click();
    const themeMenu = await page.locator('#panelThemePanel').boundingBox();
    if (!themeMenu || Math.abs(themeMenu.width - theme.width) > 1) {
        throw Error(`Theme menu does not match the control width: ${JSON.stringify({ theme, themeMenu })}`);
    }
    await page.locator('#panelThemeTrigger').click();

    const blacklistInput = page.locator('#bubbleBlacklistInput');
    const expectedHost = await page.evaluate(() => location.hostname.replace(/^www\./, ''));
    if (await blacklistInput.getAttribute('placeholder') !== expectedHost) {
        throw Error(`Blacklist placeholder is not the current site: ${await blacklistInput.getAttribute('placeholder')}`);
    }
    await blacklistInput.focus();
    if (await blacklistInput.evaluate(element => getComputedStyle(element).outlineStyle) !== 'none') {
        throw Error('Blacklist input still has a focus outline');
    }
    await page.locator('#bubbleBlacklistAdd').click();
    if (!(await page.locator('#bubbleBlacklistList').textContent()).includes(expectedHost)) {
        throw Error('Add does not blacklist the current site when the input is empty');
    }

    await page.locator('#settingsHeaderTitle').click();
    if (await page.locator('#settingsPanel').isVisible()) throw Error('Settings title did not close settings');
    await page.locator('#settingsButton').click();

    const hostClassBefore = await page.locator('#utstShadowHost').getAttribute('class');
    const themeTrigger = page.locator('#panelThemeTrigger');
    await themeTrigger.click();
    const darkTheme = page.locator('#panelThemeGrid button[data-theme="dark"]');
    await darkTheme.dispatchEvent('pointerenter', { pointerType: 'mouse' });
    if (!await page.locator('#utstShadowHost').evaluate(element => element.classList.contains('utst-theme-dark'))) {
        throw Error('Hovering the dark theme does not preview it');
    }
    await darkTheme.dispatchEvent('pointerleave', { pointerType: 'mouse' });
    if ((await page.locator('#utstShadowHost').getAttribute('class')) !== hostClassBefore) {
        throw Error('Leaving a theme option does not restore the saved theme');
    }

    const lightTheme = page.locator('#panelThemeGrid button[data-theme="light"]');
    await lightTheme.dispatchEvent('pointerenter', { pointerType: 'mouse' });
    const lightBorders = await page.locator('#panelThemeGrid button').evaluateAll(buttons =>
        buttons.map(button => getComputedStyle(button).borderColor)
    );
    if (lightBorders.some(color => color === 'rgb(255, 255, 255)' || color === 'rgba(255, 255, 255, 0)')) {
        throw Error(`Theme option borders disappear in the light preview: ${JSON.stringify(lightBorders)}`);
    }
    await lightTheme.dispatchEvent('pointerleave', { pointerType: 'mouse' });

    const logoSource = await page.locator('.utst-header-logo').first().getAttribute('src');
    if (!logoSource?.endsWith('/assets/icons/Icon_Translate_Script.png')) throw Error('UTST icon is not the generated PNG');
    return { currentSiteReady: true, uniformSettingsControls: true, blacklistFocusClean: true, titleClosesSettings: true, themeHoverPreview: true, generatedImageIcon: true };
}
