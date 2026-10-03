async (page) => {
    const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const mobile = await context.newPage();
    const errors = [];
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto('http://127.0.0.1:4174/tests/browser-fixture.html');
    await mobile.evaluate(() => {
        document.body.style.background = '#181818'; document.body.style.color = '#eeeeee';
        const p = document.createElement('p'); p.id = 'dynamic'; p.textContent = 'Dynamic SPA text'; document.body.appendChild(p);
        p.scrollIntoView();
        const range = document.createRange(); range.selectNodeContents(p); getSelection().removeAllRanges(); getSelection().addRange(range);
        document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch' }));
    });
    await mobile.waitForTimeout(300);
    await mobile.locator('#utstSelectionBubbleAction').tap();
    await mobile.waitForTimeout(180);
    const panel = await mobile.locator('#utstTranslationBox').boundingBox();
    if (panel.x < 0 || panel.y < 0 || panel.x + panel.width > 391 || panel.y + panel.height > 845) throw Error('Scrolled mobile bounds');
    const controls = await mobile.locator('#utstTranslationBox [role="button"]').evaluateAll(elements => elements.filter(el => el.getClientRects().length).map(el => ({ id: el.id, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
    if (controls.some(c => c.width < 44 || c.height < 44)) throw Error(JSON.stringify(controls));
    await mobile.locator('#fullscreenToggle').tap();
    await mobile.locator('#fullscreenSource').fill('مرحبا بالعالم\n日本語 🙂');
    await mobile.waitForTimeout(600);
    if (await mobile.locator('#fullscreenSource').getAttribute('dir') !== 'auto') throw Error('RTL direction');
    await mobile.setViewportSize({ width: 844, height: 390 });
    await mobile.waitForTimeout(100);
    const landscape = await mobile.locator('#fullscreenPanel').boundingBox();
    if (landscape.x < 0 || landscape.x + landscape.width > 845) throw Error('Landscape overflow');
    await mobile.setViewportSize({ width: 390, height: 260 });
    await mobile.waitForTimeout(100);
    const keyboard = await mobile.locator('#fullscreenPanel').boundingBox();
    if (keyboard.y < 0 || keyboard.y + keyboard.height > 261) throw Error('Reduced visible viewport');
    await mobile.screenshot({ path: 'output/playwright/touch-keyboard-sized.png' });
    await mobile.locator('#fullscreenClose').tap();
    await mobile.locator('#closeButton').tap();
    await mobile.evaluate(() => {
        document.querySelector('#editor').scrollIntoView();
        const editor = document.querySelector('#editor'); editor.focus(); editor.setSelectionRange(0,8);
    });
    await mobile.waitForTimeout(200);
    await mobile.locator('#utstSelectionBubbleAction').tap();
    await mobile.waitForTimeout(160);
    const selection = await mobile.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (selection !== 'Selected') throw Error('Touch input selection');
    await context.close();
    if (errors.length) throw Error(errors.join('\n'));
    return { touch: true, dynamicSelection: true, scrolledPanel: panel, landscape, reducedViewport: keyboard, controls, selectedInput: selection, errors };
}
