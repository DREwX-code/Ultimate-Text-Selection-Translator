async (page) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html');

    await page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await page.locator('#utstSelectionBubbleAction').click();
    await page.locator('#panelSourceDictate').waitFor({ state: 'visible' });
    await page.locator('#panelSourceText').evaluate(element => {
        element.textContent = 'ABCDE';
        const range = document.createRange();
        range.setStart(element.firstChild, 2);
        range.collapse(true);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        element.focus();
    });
    await page.locator('#panelSourceDictate').click();
    await page.waitForFunction(() => qaRecognitionInstances.length === 1);
    await page.evaluate(() => qaRecognitionInstances[0].onresult({
        results: [{ 0: { transcript: 'dictée en direct' }, isFinal: false }]
    }));
    const mobileSource = await page.locator('#panelSourceText').textContent();
    if (mobileSource !== 'ABdictée en directCDE') throw Error('Dictation was not inserted at the mobile cursor');
    if (!await page.locator('#panelSourceDictate').evaluate(button => button.classList.contains('utst-dictating'))) {
        throw Error('The active microphone state is missing on mobile');
    }
    await page.locator('#panelSourceDictate').click();
    if (await page.locator('#panelSourceDictate').evaluate(button => button.classList.contains('utst-dictating'))) {
        throw Error('The microphone did not stop on its second click');
    }

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('#translationText').evaluate(element => {
        element.textContent = 'ABCDEF';
        const range = document.createRange();
        range.setStart(element.firstChild, 3);
        range.collapse(true);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        element.focus();
    });
    await page.locator('#panelDictate').click();
    await page.waitForFunction(() => qaRecognitionInstances.length === 2);
    await page.evaluate(() => qaRecognitionInstances[1].onresult({
        results: [{ 0: { transcript: 'X' }, isFinal: false }]
    }));
    if (await page.locator('#translationText').textContent() !== 'ABCXDEF') {
        throw Error('Popup dictation was not inserted at the translation cursor');
    }
    if (!await page.locator('#panelDictate').evaluate(button => button.classList.contains('utst-dictating'))) {
        throw Error('The popup microphone does not show its active stop state');
    }
    await page.locator('#panelDictate').click();

    await page.locator('#fullscreenToggle').click();
    await page.locator('#fullscreenSource').evaluate(element => {
        element.value = 'ABCDE';
        element.setSelectionRange(2, 2);
        element.focus();
    });
    await page.locator('#fullscreenSourceDictate').click();
    await page.waitForFunction(() => qaRecognitionInstances.length === 3);
    await page.evaluate(() => qaRecognitionInstances[2].onresult({
        results: [{ 0: { transcript: 'continuation du volet' }, isFinal: true }]
    }));
    const drawerSource = await page.locator('#fullscreenSource').inputValue();
    if (drawerSource !== 'ABcontinuation du voletCDE') throw Error('Dictation was not inserted at the drawer cursor');
    await page.locator('#fullscreenSourceDictate').click();
    if (await page.locator('#fullscreenSourceDictate').evaluate(button => button.classList.contains('utst-dictating'))) {
        throw Error('The drawer microphone did not stop on its second click');
    }
    await page.waitForTimeout(450);
    const translatedQuery = await page.evaluate(() => new URL(qaRequests.at(-1)).searchParams.get('q'));
    if (!translatedQuery.includes('continuation du volet')) throw Error('Dictation did not trigger live translation');
    await page.locator('#fullscreenClose').click();
    if (errors.length) throw Error(errors.join('\n'));
    return { mobileCursorInsertion: true, popupCursorInsertion: true, drawerCursorInsertion: true, sameButtonStops: true };
}
