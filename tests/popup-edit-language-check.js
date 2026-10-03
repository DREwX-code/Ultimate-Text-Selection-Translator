async (page) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?popup-edit-language=1');
    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.locator('#utstSelectionBubbleAction').click();
    await page.waitForTimeout(220);
    await page.locator('#translationText').evaluate(element => {
        element.textContent = 'Bonjour manuel';
        element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#targetLang').selectOption('de');
    await page.waitForTimeout(460);
    const state = await page.evaluate(() => {
        const root = document.querySelector('#utstShadowHost').shadowRoot;
        return {
            source: root.querySelector('#panelSourceText').textContent.trim(),
            sourceLanguage: root.querySelector('#sourceLang').value,
            targetLanguage: root.querySelector('#targetLang').value,
            translatedRequest: qaRequests.some(url => new URL(url).searchParams.get('q') === 'Bonjour manuel')
        };
    });
    if (state.source !== 'Bonjour manuel' || state.targetLanguage !== 'de' || !state.translatedRequest) {
        throw Error(`Manual translation was not promoted to the source field: ${JSON.stringify(state)}`);
    }
    return { manualTextBecomesSource: true, targetLanguageChanged: true };
}
