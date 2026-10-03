async (page) => {
    async function openPopup(targetPage) {
        await targetPage.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
        await targetPage.locator('#sample').evaluate(element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            getSelection().removeAllRanges();
            getSelection().addRange(range);
        });
        await targetPage.waitForTimeout(180);
        await targetPage.locator('#utstSelectionBubbleAction').click();
        await targetPage.waitForTimeout(180);
    }

    await page.setViewportSize({ width: 1280, height: 800 });
    await openPopup(page);
    if ((await page.locator('#dragHandle').textContent()).trim() !== 'UTST') throw Error('The header still displays Move');
    await page.locator('#translationText').focus();
    if (await page.locator('#translationText').evaluate(element => getComputedStyle(element).outlineStyle) !== 'none') {
        throw Error('Translation input keeps a focus outline');
    }
    const closeTransform = await page.locator('#closeButton').evaluate(element => getComputedStyle(element).transform);
    if (closeTransform !== 'none') throw Error(`Close button is still scaled: ${closeTransform}`);

    await page.locator('#fullscreenToggle').click();
    await page.waitForTimeout(100);
    if (!await page.locator('#fullscreenOverlay').evaluate(element => element.classList.contains('utst-side-panel'))) {
        throw Error('Desktop action does not open the side panel');
    }
    if (await page.locator('#fullscreenToggle').getAttribute('title') !== 'Ouvrir le volet latéral'
        || await page.locator('#fullscreenTitle').textContent() !== 'UTST') {
        throw Error('The side panel header was not simplified to UTST');
    }
    if (await page.locator('#utstTranslationBox').isVisible()) {
        throw Error('The original popup remains visible behind the side panel');
    }
    const panel = await page.locator('#fullscreenPanel').boundingBox();
    const bodyPadding = await page.evaluate(() => parseInt(getComputedStyle(document.body).paddingRight, 10));
    if (panel.y !== 0 || Math.abs(panel.x + panel.width - 1280) > 4 || bodyPadding !== Math.round(panel.width)) {
        throw Error(`Side panel does not reserve page space: ${JSON.stringify({ panel, bodyPadding })}`);
    }
    await page.locator('#fullscreenSettings').click();
    if (!await page.locator('#fullscreenOverlay').evaluate(element => element.classList.contains('utst-drawer-settings-open'))) {
        throw Error('The side-panel settings button does not open the embedded settings');
    }
    if (!await page.locator('#settingsPanel').isVisible()) throw Error('Drawer settings are not visible');
    await page.locator('#fullscreenSettings').click();

    const resizeHandle = page.locator('#fullscreenResizeHandle');
    const handle = await resizeHandle.boundingBox();
    await page.mouse.move(handle.x + 5, handle.y + 200);
    await page.mouse.down();
    await page.mouse.move(handle.x - 90, handle.y + 200);
    await page.mouse.up();
    const resizedPanel = await page.locator('#fullscreenPanel').boundingBox();
    const resizedPadding = await page.evaluate(() => parseInt(getComputedStyle(document.body).paddingRight, 10));
    if (resizedPanel.width <= panel.width + 40 || resizedPadding !== Math.round(resizedPanel.width)) {
        throw Error('The side-panel width cannot be adjusted');
    }
    await page.locator('#fullscreenClose').click();
    await page.waitForTimeout(60);
    if (await page.evaluate(() => document.body.style.paddingRight)) throw Error('Page space was not restored after closing the side panel');

    await page.setViewportSize({ width: 900, height: 700 });
    await openPopup(page);
    const beforeResize = await page.locator('#utstTranslationBox').boundingBox();
    await page.setViewportSize({ width: 620, height: 700 });
    await page.waitForTimeout(120);
    const afterResize = await page.locator('#utstTranslationBox').boundingBox();
    if (afterResize.y <= 10 || afterResize.x < -1 || afterResize.x + afterResize.width > 621) {
        throw Error(`Narrow desktop moved the popup to a bad position: ${JSON.stringify({ beforeResize, afterResize })}`);
    }
    return { imageHeader: true, brandedHeader: true, cleanControls: true, drawerSettings: true, drawerResize: true, sidePanelReservesSpace: true, narrowDesktopStable: true };
}
