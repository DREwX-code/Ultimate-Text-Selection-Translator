async (page) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?dictation-language=1');
    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.locator('#utstSelectionBubbleAction').click();
    await page.locator('#fullscreenToggle').click();
    await page.locator('#fullscreenSourceDictate').click();
    await page.waitForFunction(() => qaRecognitionInstances.length === 1);
    const initialLanguage = await page.evaluate(() => qaRecognitionInstances[0].lang);
    await page.locator('#fullscreenSource').evaluate(element => {
        element.value = 'bonjour, ceci est une dictée française';
        element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForFunction(() => qaRecognitionInstances.length === 2);
    const detectedLanguage = await page.evaluate(() => qaRecognitionInstances[1].lang);
    if (!/^fr(?:-|$)/i.test(detectedLanguage)) {
        throw Error(`Dictation did not adopt the detected language: ${JSON.stringify({ initialLanguage, detectedLanguage })}`);
    }
    await page.locator('#fullscreenSourceDictate').click();
    await page.locator('#fullscreenClose').click();
    return { initialLanguage, detectedLanguage, languageUpdatedWhileDictating: true };
}
