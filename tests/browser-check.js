async (page) => {
    const results = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const select = async () => {
        await page.evaluate(() => {
            const range = document.createRange(); range.selectNodeContents(document.querySelector('#sample'));
            getSelection().removeAllRanges(); getSelection().addRange(range);
        });
        await page.locator('#utstSelectionBubbleAction').waitFor({ state: 'visible' });
        await page.locator('#utstSelectionBubbleAction').click();
        await page.waitForFunction(() => document.querySelector('#utstShadowHost').shadowRoot.querySelector('#translationText').textContent.includes('Bonjour'));
    };
    const bounds = async (id) => page.locator(id).evaluate(element => {
        const r = element.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, overflow: element.scrollWidth > element.clientWidth + 1,
            fits: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 };
    });
    for (const [width, height] of [[1280,720],[320,568],[390,844],[844,390],[768,1024]]) {
        await page.setViewportSize({ width, height });
        await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html');
        await select();
        const panel = await bounds('#utstTranslationBox');
        if (!panel.fits || panel.overflow) throw Error(`Panel ${width}: ${JSON.stringify(panel)}`);
        await page.locator('#settingsButton').click();
        const settings = await bounds('#settingsPanel');
        if (settings.overflow) throw Error(`Settings overflow ${width}`);
        await page.locator('#backButton').click();
        await page.locator('#fullscreenToggle').click();
        const fullscreen = await bounds('#fullscreenPanel');
        if (!fullscreen.fits || fullscreen.overflow) throw Error(`Fullscreen ${width}: ${JSON.stringify(fullscreen)}`);
        if (width === 320 || width === 1280) await page.screenshot({ path: `output/playwright/fullscreen-${width}.png` });
        await page.locator('#fullscreenSource').fill('New text');
        await page.waitForTimeout(500);
        if (!(await page.locator('#fullscreenTarget').inputValue()).includes('Traduction')) throw Error('Live translation');
        await page.locator('#fullscreenClose').click();
        if (await page.evaluate(() => document.body.style.position === 'fixed')) throw Error('Scroll lock leaked');
        if (width === 320 || width === 1280) await page.screenshot({ path: `output/playwright/panel-${width}.png` });
        results.push({width,height,panel,fullscreen});
    }
    await page.locator('#closeButton').click();
    await page.locator('#editor').focus();
    await page.locator('#editor').evaluate(el => el.setSelectionRange(0,8));
    await page.waitForTimeout(220);
    await page.locator('#utstSelectionBubbleAction').click();
    await page.waitForTimeout(150);
    const selected = await page.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (selected !== 'Selected') throw Error(`Input selection leaked: ${selected}`);
    await page.locator('#fullscreenToggle').click();
    await page.evaluate(() => { qaMode = 'error'; });
    await page.locator('#fullscreenSource').fill('Network failure test');
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Retry / Réessayer', exact: true }).click();
    await page.evaluate(() => { qaMode = 'success'; });
    await page.waitForTimeout(500);
    if (!(await page.locator('#fullscreenTarget').inputValue()).includes('Traduction')) throw Error('Retry failed');
    await page.locator('#fullscreenSource').fill('Closed before debounce');
    const before = await page.evaluate(() => qaRequests.length);
    await page.locator('#fullscreenClose').click();
    await page.waitForTimeout(500);
    if (await page.evaluate(() => qaRequests.length) !== before) throw Error('Request after closing');
    if (errors.length) throw Error(errors.join('\n'));
    return {results, inputSelection: selected, retry: true, closeCancelsDebounce: true, errors};
}
