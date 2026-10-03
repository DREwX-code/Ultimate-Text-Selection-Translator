async (page) => {
    const context = await page.context().browser().newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3
    });
    const mobile = await context.newPage();
    const errors = [];
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');

    await mobile.locator('#sample').evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
    });
    await mobile.waitForTimeout(220);
    await mobile.locator('#utstSelectionBubbleAction').tap();
    await mobile.waitForTimeout(220);

    if (!await mobile.locator('#panelSourceSection').isVisible()) throw Error('Source section is not visible on mobile');
    if (await mobile.locator('#fullscreenToggle').isVisible()) throw Error('Fullscreen action is still visible on mobile');
    const sourceText = await mobile.locator('#panelSourceText').textContent();
    const translatedText = await mobile.locator('#translationText').textContent();
    if (!sourceText.includes('Hello world')) throw Error('Original text is missing');
    if (!translatedText.includes('Bonjour le monde')) throw Error('Translated text is missing');
    if (await mobile.locator('#panelSourceLanguageLabel').isVisible() || await mobile.locator('#panelTargetLanguageLabel').isVisible()) {
        throw Error('Language labels are repeated below the mobile selectors');
    }
    if (await mobile.locator('#panelSourceText').getAttribute('contenteditable') !== 'true'
        || await mobile.locator('#translationText').getAttribute('contenteditable') !== 'true') {
        throw Error('Popup texts are not editable');
    }

    const detectedLabel = await mobile.locator('#panelSourceLanguageLabel').textContent();
    if (!/\(.+\)/.test(detectedLabel) || detectedLabel.includes('(…)')) throw Error(`Detected language label is incomplete: ${detectedLabel}`);
    const sourcePickerLabel = await mobile.locator('#sourceLang option:checked').textContent();
    if (!/\(.+\)/.test(sourcePickerLabel)) throw Error(`Source picker does not show the detected language: ${sourcePickerLabel}`);
    for (const selector of ['#panelSourceCopy', '#panelSourceSpeak', '#copyButton', '#speakButton']) {
        if (!await mobile.locator(selector).isVisible()) throw Error(`${selector} is not visible`);
    }
    const sourceSpeakBox = await mobile.locator('#panelSourceSpeak').boundingBox();
    const sourceCopyBox = await mobile.locator('#panelSourceCopy').boundingBox();
    const targetSpeakBox = await mobile.locator('#speakButton').boundingBox();
    const sourceSpeakIcon = await mobile.locator('#panelSourceSpeak svg').boundingBox();
    const targetSpeakIcon = await mobile.locator('#speakButton svg').boundingBox();
    const targetCopyBox = await mobile.locator('#copyButton').boundingBox();
    const targetCopyIcon = await mobile.locator('#copyButton svg').boundingBox();
    const sourceTextBox = await mobile.locator('#panelSourceText').boundingBox();
    if (sourceSpeakBox.y < sourceTextBox.y + sourceTextBox.height || sourceCopyBox.y < sourceTextBox.y + sourceTextBox.height) {
        throw Error('Source actions are not below the source text');
    }
    if (sourceSpeakBox.width !== sourceCopyBox.width || sourceSpeakBox.height !== sourceCopyBox.height
        || sourceSpeakBox.width !== targetSpeakBox.width || sourceSpeakBox.height !== targetSpeakBox.height
        || targetSpeakBox.width !== targetCopyBox.width || targetSpeakBox.height !== targetCopyBox.height
        || sourceSpeakIcon.width !== targetSpeakIcon.width || sourceSpeakIcon.height !== targetSpeakIcon.height
        || targetSpeakIcon.width !== targetCopyIcon.width || targetSpeakIcon.height !== targetCopyIcon.height) {
        throw Error('Bottom actions are not uniform');
    }

    await mobile.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async () => {} }
    }));
    await mobile.locator('#panelSourceCopy').tap();
    if (!await mobile.locator('#panelSourceCopy .utst-copy-check').count()) throw Error('Source copy does not show a green check');
    await mobile.locator('#copyButton').tap();
    if (!await mobile.locator('#copyButton .utst-copy-check').count()) throw Error('Translated copy does not show a green check');

    const requestsBeforeSpeech = await mobile.evaluate(() => window.qaRequests.length);
    await mobile.locator('#panelSourceSpeak').tap();
    await mobile.waitForTimeout(20);
    const sourceActiveStroke = await mobile.locator('#panelSourceSpeak svg path').first().evaluate(element => element.style.stroke);
    const targetWhileSourceActiveStroke = await mobile.locator('#speakButton svg path').first().evaluate(element => element.style.stroke);
    if (!sourceActiveStroke.includes('64') || targetWhileSourceActiveStroke === sourceActiveStroke) {
        throw Error('Listening to the source activates the translated-text button');
    }
    await mobile.locator('#speakButton').tap();
    await mobile.waitForTimeout(20);
    const sourceWhileTargetActiveStroke = await mobile.locator('#panelSourceSpeak svg path').first().evaluate(element => element.style.stroke);
    const targetActiveStroke = await mobile.locator('#speakButton svg path').first().evaluate(element => element.style.stroke);
    if (sourceWhileTargetActiveStroke === targetActiveStroke || !targetActiveStroke.includes('64')) {
        throw Error('Listening to the translation does not activate its own button');
    }
    const requestsAfterSpeech = await mobile.evaluate(() => window.qaRequests.length);
    if (requestsAfterSpeech !== requestsBeforeSpeech + 2) throw Error('Speech did not start on the first tap');
    if (await mobile.locator('#speakTooltip').isVisible()) throw Error('Obsolete speech menu opened');

    await mobile.locator('#panelSwap').tap();
    await mobile.waitForTimeout(180);
    const swappedSourceLanguage = await mobile.locator('#sourceLang').inputValue();
    const swappedTargetLanguage = await mobile.locator('#targetLang').inputValue();
    if (swappedSourceLanguage !== 'fr' || swappedTargetLanguage !== 'en') {
        throw Error(`Popup language swap failed: ${swappedSourceLanguage} -> ${swappedTargetLanguage}; page errors: ${errors.join(' | ')}`);
    }
    if (!((await mobile.locator('#panelSourceText').textContent()) || '').includes('Bonjour le monde')) {
        throw Error('Popup text swap failed');
    }

    await mobile.locator('#panelSourceText').evaluate(element => {
        element.textContent = 'Texte mobile modifié';
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    });
    await mobile.waitForTimeout(520);
    const editedRequest = await mobile.evaluate(() => window.qaRequests.at(-1));
    if (!editedRequest || new URL(editedRequest).searchParams.get('q') !== 'Texte mobile modifié') {
        throw Error('Editing the source text did not trigger translation');
    }
    await mobile.locator('#translationText').evaluate(element => {
        element.textContent = 'Traduction éditée';
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    });

    const sourceTrigger = mobile.locator('#sourceLangTrigger');
    await sourceTrigger.tap();
    if (!await mobile.locator('#sourceLangMenu').isVisible()) throw Error('Language menu did not open on first tap');
    const sourceSearch = mobile.locator('#sourceLangMenu .inlineLangSearch');
    await sourceSearch.focus();
    const searchOutline = await sourceSearch.evaluate(element => getComputedStyle(element).outlineStyle);
    const triggerOutline = await sourceTrigger.evaluate(element => getComputedStyle(element).outlineStyle);
    if (searchOutline !== 'none' || triggerOutline !== 'none') throw Error('Language menu focus still draws an outline');
    await sourceTrigger.tap();
    if (await mobile.locator('#sourceLangMenu').isVisible()) throw Error('Language menu did not close on second tap');

    await mobile.locator('#settingsButton').tap();
    if (!await mobile.locator('#settingsPanel').isVisible()) throw Error('Settings did not open');
    if (await mobile.locator('#shortcutCaptureLabel').isVisible()) throw Error('Keyboard shortcut is visible on mobile');
    const settingsLanguageTrigger = mobile.locator('#defaultTranslateLangTrigger');
    const triggerBox = await settingsLanguageTrigger.boundingBox();
    const cdp = await context.newCDPSession(mobile);
    const touchPoint = { x: triggerBox.x + triggerBox.width / 2, y: triggerBox.y + triggerBox.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touchPoint] });
    for (let step = 1; step <= 7; step++) {
        await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: touchPoint.x, y: touchPoint.y - step * 10 }]
        });
        await mobile.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobile.waitForTimeout(180);
    if (await mobile.locator('#defaultTranslateLangMenu').isVisible()) throw Error('Scrolling opened the settings language menu');
    await mobile.locator('#settingsButton').tap();
    if (await mobile.locator('#settingsPanel').isVisible()) throw Error('Settings did not close on second tap');

    const layouts = [];
    for (const [width, height] of [[390, 844], [320, 568], [390, 260]]) {
        await mobile.setViewportSize({ width, height });
        await mobile.waitForTimeout(120);
        const box = await mobile.locator('#utstTranslationBox').boundingBox();
        if (!box || box.x < -1 || box.y < -1 || box.x + box.width > width + 1 || box.y + box.height > height + 1) {
            throw Error(`Panel overflow at ${width}x${height}: ${JSON.stringify(box)}`);
        }
        if (box.height > 450) throw Error(`Popup keeps excessive empty space at ${width}x${height}: ${box.height}px`);
        const horizontalOverflow = await mobile.locator('#translatorPanel').evaluate(element => element.scrollWidth > element.clientWidth + 1);
        if (horizontalOverflow) throw Error(`Horizontal overflow at ${width}x${height}`);
        await mobile.locator('#copyButton').scrollIntoViewIfNeeded();
        const targetActionBox = await mobile.locator('#copyButton').boundingBox();
        if (!targetActionBox || targetActionBox.y < -1 || targetActionBox.y + targetActionBox.height > height + 1) {
            throw Error(`Edited translation actions are unreachable at ${width}x${height}`);
        }
        layouts.push({ width, height, box });
    }
    await mobile.screenshot({ path: 'output/playwright/mobile-compact.png' });

    await context.close();
    if (errors.length) throw Error(errors.join('\n'));
    return {
        detectedLabel,
        directSpeech: true,
        editableTexts: true,
        popupSwap: true,
        uniformBottomActions: true,
        independentSpeechState: true,
        compactHeight: true,
        menusToggle: true,
        scrollDoesNotOpenMenu: true,
        shortcutHidden: true,
        fullscreenHidden: true,
        layouts
    };
}
