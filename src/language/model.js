import {
    getLanguageName,
    getLocalizedValue,
    getSupportedUiLanguages
} from '../utils.js';

export function createLanguageModel({ translationLibrary, browserLang }) {
    const languageNames = translationLibrary.languageNames;
    const englishLangNames = getLanguageName(languageNames, 'en', {});
    const supportedUiLanguages = getSupportedUiLanguages(translationLibrary, languageNames);

    const googleTranslateLanguages = {
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'ny': 'Chichewa',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'he': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'rw': 'Kinyarwanda',
        'ko': 'Korean',
        'ku': 'Kurdish',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'or': 'Odia',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'pa': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scots Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'tt': 'Tatar',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'tk': 'Turkmen',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'ug': 'Uyghur',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu'
    };

    const commonFavoriteTargetLangs = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh-CN', 'ja'];

    function resolveUiLang(preference) {
        if (preference === 'browser') {
            return languageNames[browserLang] ? browserLang : 'en';
        }
        return languageNames[preference] ? preference : (languageNames[browserLang] ? browserLang : 'en');
    }

    function getLocalizedRuntimeState(preference) {
        const localizedLanguageNames = languageNames[resolveUiLang(preference)];
        return {
            langNames: localizedLanguageNames,
            errors: localizedLanguageNames.errors,
            tooltips: localizedLanguageNames.tooltips,
            dragHandleLabel: getLocalizedValue(localizedLanguageNames, languageNames.en, 'dragHandleLabel'),
            overlayLabels: getLocalizedValue(localizedLanguageNames, languageNames.en, 'overlay'),
            settingsTitle: getLocalizedValue(localizedLanguageNames, languageNames.en, 'settingsTitle'),
            settingsDefaultLabel: getLocalizedValue(localizedLanguageNames, languageNames.en, 'settingsDefaultLabel'),
            settingsToolLabel: getLocalizedValue(localizedLanguageNames, languageNames.en, 'settingsToolLabel')
        };
    }

    function getDefaultTargetLanguage(localizedLanguageNames) {
        const languages = [
            { code: 'auto', name: getLanguageName(englishLangNames, 'auto', localizedLanguageNames.auto) },
            { code: 'en', name: getLanguageName(englishLangNames, 'en', 'English') },
            { code: 'fr', name: getLanguageName(englishLangNames, 'fr', 'French') },
            { code: 'es', name: getLanguageName(englishLangNames, 'es', 'Spanish') },
            { code: 'de', name: getLanguageName(englishLangNames, 'de', 'German') },
            { code: 'it', name: getLanguageName(englishLangNames, 'it', 'Italian') },
            { code: 'pt', name: getLanguageName(englishLangNames, 'pt', 'Portuguese') },
            { code: 'ru', name: getLanguageName(englishLangNames, 'ru', 'Russian') },
            { code: 'zh-CN', name: getLanguageName(englishLangNames, 'zh-CN', 'Chinese (Simplified)') },
            { code: 'ja', name: getLanguageName(englishLangNames, 'ja', 'Japanese') },
            { code: 'navigator', name: getLanguageName(englishLangNames, 'navigator', 'Browser language') }
        ];
        return languages.some(lang => lang.code === browserLang && lang.code !== 'auto') ? browserLang : 'en';
    }

    function buildFavoriteTargetLanguages() {
        const favorites = ['navigator'];
        if (googleTranslateLanguages[browserLang] && !favorites.includes(browserLang)) {
            favorites.push(browserLang);
        }
        commonFavoriteTargetLangs.forEach(code => {
            if (!favorites.includes(code)) {
                favorites.push(code);
            }
        });
        return favorites;
    }

    let favoriteTargetLangs = null;
    let sortedGoogleLanguageEntries = null;

    function initializeTargetLanguageCollections() {
        if (favoriteTargetLangs && sortedGoogleLanguageEntries) return;
        favoriteTargetLangs = buildFavoriteTargetLanguages();
        sortedGoogleLanguageEntries = Object.entries(googleTranslateLanguages)
            .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
    }

    function getLanguageLabel(code, localizedLanguageNames) {
        if (code === 'auto') {
            return localizedLanguageNames.auto || englishLangNames.auto || 'Detect language';
        }
        if (code === 'navigator') {
            return englishLangNames.navigator || 'Browser language';
        }
        return englishLangNames[code] || googleTranslateLanguages[code] || code;
    }

    function buildTargetLanguageOptions(includeNavigator = false, localizedLanguageNames) {
        initializeTargetLanguageCollections();
        const favorites = favoriteTargetLangs
            .filter(code => code === 'navigator' ? includeNavigator : googleTranslateLanguages[code])
            .map(code => {
                const optionValue = code === 'navigator' ? 'navigator' : code;
                return `<option value="${optionValue}">${getLanguageLabel(optionValue, localizedLanguageNames)}</option>`;
            })
            .join('');

        const favoriteCodes = new Set(favoriteTargetLangs.filter(code => code !== 'navigator'));
        const others = sortedGoogleLanguageEntries
            .filter(([code]) => !favoriteCodes.has(code))
            .map(([code, name]) => `<option value="${code}">${name}</option>`)
            .join('');

        const parts = [];
        if (favorites) {
            parts.push(favorites);
        }
        if (others) {
            if (favorites) {
                parts.push('<option value="" disabled>--------------------</option>');
            }
            parts.push(others);
        }
        return parts.join('');
    }

    function getToolLanguageLabel(code) {
        if (code === 'browser') {
            return englishLangNames.navigator || 'Browser language';
        }
        return englishLangNames[code] || languageNames.en[code] || code;
    }

    function buildToolLanguageOptionsHtml() {
        return ['browser', ...supportedUiLanguages]
            .map(code => `<option value="${code}">${getToolLanguageLabel(code)}</option>`)
            .join('');
    }

    function buildSourceLanguageOptionsHtml(localizedLanguageNames) {
        const entries = Object.entries(googleTranslateLanguages)
            .sort(([, a], [, b]) => a.localeCompare(b));
        const options = entries
            .map(([code, name]) => `<option value="${code}">${name}</option>`)
            .join('');
        return `<option value="auto">${localizedLanguageNames.auto}</option>${options}`;
    }

    return {
        buildSourceLanguageOptionsHtml,
        buildTargetLanguageOptions,
        buildToolLanguageOptionsHtml,
        englishLangNames,
        getDefaultTargetLanguage,
        getLanguageLabel,
        getLocalizedRuntimeState,
        googleTranslateLanguages,
        languageNames,
        resolveUiLang,
        supportedUiLanguages
    };
}
