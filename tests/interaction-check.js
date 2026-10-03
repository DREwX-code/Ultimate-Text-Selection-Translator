async (page) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html');
    const selectText = async selector => {
        await page.locator(selector).evaluate(el => {
            const r = document.createRange(); r.selectNodeContents(el);
            getSelection().removeAllRanges(); getSelection().addRange(r);
        });
        await page.waitForTimeout(220);
        await page.locator('#utstSelectionBubbleAction').click();
        await page.waitForTimeout(180);
    };
    const checkMenu = async locator => {
        const box = await locator.boundingBox();
        if (!box || box.x < 0 || box.x + box.width > 321 || box.y < 0 || box.y + box.height > 569) throw Error(`Menu bounds: ${JSON.stringify(box)}`);
    };
    await selectText('#sample');
    await page.locator('#targetLangTrigger').click();
    const menu = page.locator('.utst-inline-lang-panel:visible');
    await checkMenu(menu);
    await menu.locator('button[data-code="ar"]').click();
    await page.waitForTimeout(180);
    if (await page.locator('#targetLang').inputValue() !== 'ar') throw Error('Quick target picker');
    await page.locator('#settingsButton').click();
    for (const theme of ['light','dark','blue']) {
        await page.locator('#panelThemeTrigger').click();
        await checkMenu(page.locator('#panelThemePanel'));
        await page.locator(`[data-theme="${theme}"]`).click();
    }
    await page.locator('#backButton').click();
    await page.locator('#fullscreenToggle').click();
    await page.locator('#fullscreenTargetLangTrigger').click();
    await checkMenu(page.locator('#fullscreenTargetLangPanel'));
    await page.locator('#fullscreenTargetLangPanel button[data-code="ja"]').click();
    await page.waitForTimeout(300);
    await page.locator('#fullscreenSource').evaluate(el => {
        el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        el.value = '日本語入力'; el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });
    const before = await page.evaluate(() => qaRequests.length);
    await page.waitForTimeout(500);
    if (await page.evaluate(() => qaRequests.length) !== before) throw Error('IME translated mid-composition');
    await page.locator('#fullscreenSource').evaluate(el => el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
    await page.waitForTimeout(550);
    const request = await page.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (request !== '日本語入力') throw Error('IME lost input');
    await page.locator('#fullscreenSwap').click();
    await page.waitForTimeout(300);
    if (await page.locator('#fullscreenSourceLang').inputValue() !== 'ja') throw Error('Swap source');
    await page.locator('#fullscreenClose').click();
    await page.locator('#closeButton').click();
    await selectText('[contenteditable]');
    const editable = await page.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (!editable.startsWith('Editable')) throw Error('Contenteditable');
    await page.locator('#closeButton').click();
    await page.locator('#shadow p').evaluate(el => {
        el.tabIndex = 0; el.focus();
        const r = document.createRange(); r.selectNodeContents(el); getSelection().removeAllRanges(); getSelection().addRange(r);
    });
    await page.waitForTimeout(250);
    await page.locator('#utstSelectionBubbleAction').click();
    await page.waitForTimeout(200);
    const shadow = await page.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (!shadow.startsWith('Text inside')) throw Error('Shadow selection');
    return { quickTarget: true, themes: ['light','dark','blue'], fullscreenMenu: true, ime: true, swap: true, contenteditable: editable, openShadowRoot: shadow };
}
