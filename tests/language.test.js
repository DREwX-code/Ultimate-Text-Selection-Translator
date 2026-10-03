import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBrowserLanguage } from '../src/utils.js';
import { createLanguageModel } from '../src/language/model.js';
import { translationLibrary } from '../src/library/translation.js';
test('browser language variants preserve Chinese script and resolve service aliases', () => {
    for (const [input, expected] of [['zh-Hant-HK','zh-TW'],['zh-SG','zh-CN'],['nb-NO','no'],['fr-CA','fr'],['fil-PH','tl']]) assert.equal(normalizeBrowserLanguage(input), expected);
});
test('every supported browser language can be the default target, including Arabic', () => {
    for (const browserLang of ['ar','he','zh-TW','ko']) {
        assert.equal(createLanguageModel({ translationLibrary, browserLang }).getDefaultTargetLanguage(), browserLang);
    }
    assert.equal(createLanguageModel({ translationLibrary, browserLang: 'unsupported' }).getDefaultTargetLanguage(), 'en');
});
