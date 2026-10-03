async (page) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');

    const selectSampleText = () => page.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    });
    const invokeMenu = label => page.evaluate(menuLabel => {
        const command = window.qaMenuCommands.find(entry => entry.label === menuLabel);
        if (!command) throw Error(`Missing userscript command: ${menuLabel}`);
        command.callback();
    }, label);

    const commands = await page.evaluate(() => window.qaMenuCommands.map(entry => entry.label));
    const expected = [
        'UTST — Ouvrir la traduction',
        'UTST — Ouvrir le volet de traduction',
        'UTST — Désactiver la bulle sur ce site'
    ];
    if (JSON.stringify(commands) !== JSON.stringify(expected)) {
        throw Error(`Unexpected userscript commands: ${JSON.stringify(commands)}`);
    }

    await selectSampleText();
    await invokeMenu(expected[0]);
    await page.waitForFunction(() => document.querySelector('#utstShadowHost').shadowRoot.querySelector('#utstTranslationBox').style.display === 'block');

    await invokeMenu(expected[1]);
    await page.waitForFunction(() => document.querySelector('#utstShadowHost').shadowRoot.querySelector('#fullscreenOverlay').style.display === 'flex');
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        key: 'l',
        code: 'KeyL'
    })));
    if (await page.locator('#utstTranslationBox').isVisible()) {
        throw Error('The global shortcut reopened the popup while the side panel was active');
    }

    await page.locator('#fullscreenClose').click();
    await selectSampleText();
    await invokeMenu(expected[2]);
    await page.waitForTimeout(220);
    if (await page.locator('#utstSelectionBubble').evaluate(element => element.classList.contains('utst-visible'))) {
        throw Error('The site userscript command did not disable the selection bubble');
    }

    return { commands, popupCommand: true, panelCommand: true, shortcutBlockedInPanel: true, siteBubbleDisabled: true };
}
