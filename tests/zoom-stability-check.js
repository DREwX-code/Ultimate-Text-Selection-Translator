async (page) => {
    async function openPopup(targetPage) {
        await targetPage.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
        await targetPage.locator('#sample').evaluate(element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            getSelection().removeAllRanges();
            getSelection().addRange(range);
        });
        await targetPage.waitForTimeout(220);
        await targetPage.locator('#utstSelectionBubbleAction').click();
        await targetPage.waitForTimeout(160);
    }

    const browser = page.context().browser();
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktop = await desktopContext.newPage();
    await openPopup(desktop);
    const desktopBefore = await desktop.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    const desktopCdp = await desktopContext.newCDPSession(desktop);
    await desktopCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 });
    await desktop.waitForTimeout(160);
    const desktopAfter = await desktop.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    const desktopOverflow = await desktop.evaluate(() => ({
        x: document.documentElement.style.overflowX,
        y: document.documentElement.style.overflowY
    }));
    await desktopCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    if (desktopBefore.left !== desktopAfter.left || desktopBefore.top !== desktopAfter.top) {
        throw Error(`Desktop zoom moved popup: ${JSON.stringify({ desktopBefore, desktopAfter })}`);
    }
    if (desktopOverflow.x !== 'auto' || desktopOverflow.y !== 'auto') throw Error('Desktop zoom does not enable page scrolling');
    await desktop.locator('#closeButton').click();
    const desktopRestoredOverflow = await desktop.evaluate(() => document.documentElement.style.overflowX || document.documentElement.style.overflowY);
    if (desktopRestoredOverflow) throw Error('Desktop overflow was not restored after closing the popup');

    await openPopup(desktop);
    await desktop.locator('#fullscreenToggle').click();
    await desktop.waitForTimeout(100);
    await desktopCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 });
    await desktop.waitForTimeout(160);
    const sidePanelAtZoom = await desktop.locator('#fullscreenOverlay').evaluate(element => ({
        inlineWidth: element.style.width,
        inlineHeight: element.style.height,
        width: Math.round(element.getBoundingClientRect().width),
        layoutWidth: window.innerWidth,
        visualWidth: Math.round(window.visualViewport.width)
    }));
    await desktopCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    if (!['', 'initial'].includes(sidePanelAtZoom.inlineWidth) || !['', 'initial'].includes(sidePanelAtZoom.inlineHeight)
        || sidePanelAtZoom.width !== sidePanelAtZoom.layoutWidth
        || sidePanelAtZoom.width <= sidePanelAtZoom.visualWidth) {
        throw Error(`Side panel was constrained to the zoomed viewport: ${JSON.stringify(sidePanelAtZoom)}`);
    }
    await desktop.locator('#fullscreenClose').click();

    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3
    });
    const mobile = await mobileContext.newPage();
    await openPopup(mobile);
    const mobileBefore = await mobile.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    const mobileCdp = await mobileContext.newCDPSession(mobile);
    await mobileCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 });
    await mobile.waitForTimeout(160);
    const mobileAfter = await mobile.locator('#utstTranslationBox').evaluate(element => ({ left: element.style.left, top: element.style.top }));
    const mobileOverflow = await mobile.evaluate(() => ({
        x: document.documentElement.style.overflowX,
        y: document.documentElement.style.overflowY
    }));
    await mobileCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    if (mobileBefore.left !== mobileAfter.left || mobileBefore.top !== mobileAfter.top) {
        throw Error(`Mobile zoom moved popup: ${JSON.stringify({ mobileBefore, mobileAfter })}`);
    }
    if (mobileOverflow.x !== 'auto' || mobileOverflow.y !== 'auto') throw Error('Mobile zoom does not enable page scrolling');
    await mobile.locator('#closeButton').click();
    const mobileRestoredOverflow = await mobile.evaluate(() => document.documentElement.style.overflowX || document.documentElement.style.overflowY);
    if (mobileRestoredOverflow) throw Error('Mobile overflow was not restored after closing the popup');

    await desktopContext.close();
    await mobileContext.close();
    return { desktopStable: true, mobileStable: true, sidePanelFlowsAtZoom: true, pageScrollEnabledDuringZoom: true };
}
