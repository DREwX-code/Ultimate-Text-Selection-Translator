// ==UserScript==
// @name              Ultimate Text Selection Translator – Instantly Translate Any Selected Text
// @name:fr           Ultimate Text Selection Translator – Traduis instantanément n’importe quel texte sélectionné
// @name:es           Ultimate Text Selection Translator – Traduce al instante cualquier texto seleccionado
// @name:de           Ultimate Text Selection Translator – Übersetze sofort ausgewählten Text
// @name:ru           Ultimate Text Selection Translator – Мгновенный перевод выделенного текста
// @name:zh-CN        Ultimate Text Selection Translator – 即时翻译所选文本
// @name:zh-TW        Ultimate Text Selection Translator – 即時翻譯所選文字
// @name:ja           Ultimate Text Selection Translator – 選択テキストを即座に翻訳
// @namespace         http://tampermonkey.net/
// @version           1.3.1
// @description       Translate selected text instantly using Ctrl+L. Supports all languages and automatically detects the selected language, translating it into your browser's default language. Simple, fast, and efficient.
// @description:fr    Traduis instantanément n’importe quel texte sélectionné avec Ctrl+L. Prend en charge toutes les langues, détecte automatiquement la langue sélectionnée et la traduit dans la langue par défaut de ton navigateur. Simple, rapide et efficace.
// @description:es    Traduce al instante cualquier texto seleccionado con Ctrl+L. Compatible con todos los idiomas, detecta automáticamente el idioma seleccionado y lo traduce al idioma predeterminado de tu navegador. Simple, rápido y eficiente.
// @description:de    Übersetze ausgewählten Text sofort mit Ctrl+L. Unterstützt alle Sprachen, erkennt automatisch die ausgewählte Sprache und übersetzt sie in die Standardsprache deines Browsers. Einfach, schnell und effizient.
// @description:ru    Мгновенно переводите выделенный текст с помощью Ctrl+L. Поддерживает все языки, автоматически определяет выделенный язык и переводит его на язык по умолчанию вашего браузера. Просто, быстро и эффективно.
// @description:zh-CN 使用 Ctrl+L 可即时翻译所选文本。支持所有语言，自动检测所选语言，并翻译为浏览器的默认语言。简单、快速、高效。
// @description:zh-TW 使用 Ctrl+L 可即時翻譯所選文字。支援所有語言，自動偵測所選語言，並翻譯為瀏覽器的預設語言。簡單、快速、高效。
// @description:ja    Ctrl+L で選択したテキストを即座に翻訳。すべての言語に対応し、選択された言語を自動的に検出して、ブラウザのデフォルト言語に翻訳。シンプル、スピーディー、効率的。

// @author       Dℝ∃wX
// @copyright    2025 DℝᴇwX
// @license      Apache-2.0
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @icon         https://raw.githubusercontent.com/DREwX-code/Ultimate-Text-Selection-Translator/refs/heads/main/Icon_Translate_Script.png
// @connect      translate.googleapis.com
// @tag          translation
// @tag          text selection
// @tag          translate
// @tag          google translate
// @tag          shortcut
// @tag          productivity
// @tag          accessibility
// @tag          language
// @tag          multilingual
// @grant        GM_getValue
// @grant        GM_setValue

// ==/UserScript==

/*
Copyright 2025 Dℝ∃wX

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/



(function () {
    'use strict';

    const browserLang = navigator.language.split('-')[0];
    const supportedUiLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh-CN', 'ja'];

    const languageNames = {
        'en': {
            'auto': 'Detect',
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh-CN': 'Chinese (Simplified)',
            'ja': 'Japanese',
            'errors': {
                'noText': 'No text selected',
                'translation': 'Translation error',
                'connection': 'Connection error'
            },
            'tooltips': {
                'listenTranslated': 'Listen to translated text',
                'listenOriginal': 'Listen to original text'
            },
            'dragHandleLabel': 'Move',
            'settingsTitle': 'Settings',
            'settingsDefaultLabel': 'Default translation language:',
            'settingsToolLabel': 'Tool language:',
            'navigator': 'Browser language',
        },
        'fr': {
            'auto': 'Détecter',
            'en': 'Anglais',
            'fr': 'Français',
            'es': 'Espagnol',
            'de': 'Allemand',
            'it': 'Italien',
            'pt': 'Portugais',
            'ru': 'Russe',
            'zh-CN': 'Chinois (Simplifié)',
            'ja': 'Japonais',
            'errors': {
                'noText': 'Aucun texte sélectionné',
                'translation': 'Erreur de traduction',
                'connection': 'Erreur de connexion'
            },
            'tooltips': {
                'listenTranslated': 'Écoute le texte traduit',
                'listenOriginal': 'Écoute le texte original'
            },
            'dragHandleLabel': 'Déplacer',
            'settingsTitle': 'Paramètres',
            'settingsDefaultLabel': 'Langue de traduction par défaut :',
            'settingsToolLabel': "Langue de l'outil :",
            'navigator': 'Langue du navigateur',

        },
        'es': {
            'auto': 'Detectar',
            'en': 'Inglés',
            'fr': 'Francés',
            'es': 'Español',
            'de': 'Alemán',
            'it': 'Italiano',
            'pt': 'Portugués',
            'ru': 'Ruso',
            'zh-CN': 'Chino (Simplificado)',
            'ja': 'Japonés',
            'errors': {
                'noText': 'No hay texto seleccionado',
                'translation': 'Error de traducción',
                'connection': 'Error de conexión'
            },
            'tooltips': {
                'listenTranslated': 'Escuchar el texto traducido',
                'listenOriginal': 'Escuchar el texto original'
            },
            'dragHandleLabel': 'Mover',
            'settingsTitle': 'Configuración',
            'settingsDefaultLabel': 'Idioma de traducción predeterminado:',
            'settingsToolLabel': 'Idioma de la interfaz:',
            'navigator': 'Idioma del navegador',
        },
        'de': {
            'auto': 'Erkennen',
            'en': 'Englisch',
            'fr': 'Französisch',
            'es': 'Spanisch',
            'de': 'Deutsch',
            'it': 'Italienisch',
            'pt': 'Portugiesisch',
            'ru': 'Russisch',
            'zh-CN': 'Chinesisch (Vereinfacht)',
            'ja': 'Japanisch',
            'errors': {
                'noText': 'Kein Text ausgewählt',
                'translation': 'Übersetzungsfehler',
                'connection': 'Verbindungsfehler'
            },
            'tooltips': {
                'listenTranslated': 'Übersetzten Text anhören',
                'listenOriginal': 'Originaltext anhören'
            },
            'dragHandleLabel': 'Verschieben',
            'settingsTitle': 'Einstellungen',
            'settingsDefaultLabel': 'Standardübersetzungssprache:',
            'settingsToolLabel': 'Werkzeugsprache:',
            'navigator': 'Browser-Sprache',
        },
        'it': {
            'auto': 'Rileva',
            'en': 'Inglese',
            'fr': 'Francese',
            'es': 'Spagnolo',
            'de': 'Tedesco',
            'it': 'Italiano',
            'pt': 'Portoghese',
            'ru': 'Russo',
            'zh-CN': 'Cinese (Semplificato)',
            'ja': 'Giapponese',
            'errors': {
                'noText': 'Nessun testo selezionato',
                'translation': 'Errore di traduzione',
                'connection': 'Errore di connessione'
            },
            'tooltips': {
                'listenTranslated': 'Ascolta il testo tradotto',
                'listenOriginal': 'Ascolta il testo originale'
            },
            'dragHandleLabel': 'Spostare',
            'settingsTitle': 'Impostazioni',
            'settingsDefaultLabel': 'Lingua di traduzione predefinita:',
            'settingsToolLabel': "Lingua dell'interfaccia:",
            'navigator': 'Lingua del browser',
        },
        'pt': {
            'auto': 'Detectar',
            'en': 'Inglês',
            'fr': 'Francês',
            'es': 'Espanhol',
            'de': 'Alemão',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Russo',
            'zh-CN': 'Chinês (Simplificado)',
            'ja': 'Japonês',
            'errors': {
                'noText': 'Nenhum texto selecionado',
                'translation': 'Erro de tradução',
                'connection': 'Erro de conexão'
            },
            'tooltips': {
                'listenTranslated': 'Ouvir o texto traduzido',
                'listenOriginal': 'Ouvir o texto original'
            },
            'dragHandleLabel': 'Mover',
            'settingsTitle': 'Configurações',
            'settingsDefaultLabel': 'Idioma de tradução padrão:',
            'settingsToolLabel': 'Idioma da interface:',
            'navigator': 'Idioma do navegador',
        },
        'ru': {
            'auto': 'Определить',
            'en': 'Английский',
            'fr': 'Французский',
            'es': 'Испанский',
            'de': 'Немецкий',
            'it': 'Итальянский',
            'pt': 'Португальский',
            'ru': 'Русский',
            'zh-CN': 'Китайский (упрощённый)',
            'ja': 'Японский',
            'errors': {
                'noText': 'Текст не выделен',
                'translation': 'Ошибка перевода',
                'connection': 'Ошибка соединения'
            },
            'tooltips': {
                'listenTranslated': 'Прослушать переведённый текст',
                'listenOriginal': 'Прослушать оригинальный текст'
            },
            'dragHandleLabel': 'Переместить',
            'settingsTitle': 'Настройки',
            'settingsDefaultLabel': 'Язык перевода по умолчанию:',
            'settingsToolLabel': 'Язык интерфейса:',
            'navigator': 'Язык браузера',
        },
        'zh-CN': {
            'auto': '检测',
            'en': '英语',
            'fr': '法语',
            'es': '西班牙语',
            'de': '德语',
            'it': '意大利语',
            'pt': '葡萄牙语',
            'ru': '俄语',
            'zh-CN': '中文（简体）',
            'ja': '日语',
            'errors': {
                'noText': '未选择文本',
                'translation': '翻译错误',
                'connection': '连接错误'
            },
            'tooltips': {
                'listenTranslated': '聆听翻译文本',
                'listenOriginal': '聆听原文'
            },
            'dragHandleLabel': '移动',
            'settingsTitle': '设置',
            'settingsDefaultLabel': '默认翻译语言：',
            'settingsToolLabel': '界面语言：',
            'navigator': '浏览器语言',
        },
        'ja': {
            'auto': '検出',
            'en': '英語',
            'fr': 'フランス語',
            'es': 'スペイン語',
            'de': 'ドイツ語',
            'it': 'イタリア語',
            'pt': 'ポルトガル語',
            'ru': 'ロシア語',
            'zh-CN': '中国語（簡体）',
            'ja': '日本語',
            'errors': {
                'noText': 'テキストが選択されていません',
                'translation': '翻訳エラー',
                'connection': '接続エラー'
            },
            'tooltips': {
                'listenTranslated': '翻訳されたテキストを聞く',
                'listenOriginal': '元のテキストを聞く'
            },
            'dragHandleLabel': '移動',
            'settingsTitle': '設定',
            'settingsDefaultLabel': '既定の翻訳言語：',
            'settingsToolLabel': 'ツールの言語：',
            'navigator': 'ブラウザの言語',
        }
    };

    const storedToolLangPref = GM_getValue('defaultToolLang', 'browser');
    const normalizedToolLangPref = (storedToolLangPref === 'browser' || supportedUiLanguages.includes(storedToolLangPref))
        ? storedToolLangPref
        : 'browser';
    if (normalizedToolLangPref !== storedToolLangPref) {
        GM_setValue('defaultToolLang', normalizedToolLangPref);
    }

    function resolveUiLang(preference) {
        if (preference === 'browser') {
            return languageNames[browserLang] ? browserLang : 'en';
        }
        return languageNames[preference] ? preference : (languageNames[browserLang] ? browserLang : 'en');
    }

    let toolLanguagePreference = normalizedToolLangPref;
    const uiLang = resolveUiLang(toolLanguagePreference);
    let langNames = languageNames[uiLang];
    let errors = langNames.errors;
    let tooltips = langNames.tooltips;
    let dragHandleLabel = langNames.dragHandleLabel || languageNames.en.dragHandleLabel;
    let settingsTitle = langNames.settingsTitle || languageNames.en.settingsTitle;
    let settingsDefaultLabel = langNames.settingsDefaultLabel || languageNames.en.settingsDefaultLabel;
    let settingsToolLabel = langNames.settingsToolLabel || languageNames.en.settingsToolLabel;

    const languages = [
        { code: 'auto', name: langNames.auto },
        { code: 'en', name: langNames.en },
        { code: 'fr', name: langNames.fr },
        { code: 'es', name: langNames.es },
        { code: 'de', name: langNames.de },
        { code: 'it', name: langNames.it },
        { code: 'pt', name: langNames.pt },
        { code: 'ru', name: langNames.ru },
        { code: 'zh-CN', name: langNames['zh-CN'] },
        { code: 'ja', name: langNames.ja },
        { code: 'navigator', name: langNames.navigator }
    ];

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


    const defaultTargetLang = languages.some(lang => lang.code === browserLang && lang.code !== 'auto') ? browserLang : 'en';

    const commonFavoriteTargetLangs = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh-CN', 'ja'];
    const favoriteTargetLangs = ['navigator'];
    if (googleTranslateLanguages[browserLang] && !favoriteTargetLangs.includes(browserLang)) {
        favoriteTargetLangs.push(browserLang);
    }
    commonFavoriteTargetLangs.forEach(code => {
        if (!favoriteTargetLangs.includes(code)) {
            favoriteTargetLangs.push(code);
        }
    });
    const sortedGoogleLanguageEntries = Object.entries(googleTranslateLanguages)
        .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));

    function getLanguageLabel(code) {
        if (code === 'navigator') {
            return langNames.navigator;
        }
        return langNames[code] || googleTranslateLanguages[code] || code;
    }

    function buildTargetLanguageOptions(includeNavigator = false) {
        const favorites = favoriteTargetLangs
            .filter(code => code === 'navigator' ? includeNavigator : googleTranslateLanguages[code])
            .map(code => {
                const optionValue = code === 'navigator' ? 'navigator' : code;
                return `<option value="${optionValue}">${getLanguageLabel(optionValue)}</option>`;
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
            return langNames.navigator;
        }
        return langNames[code] || languageNames.en[code] || code;
    }

    function buildToolLanguageOptionsHtml() {
        return ['browser', ...supportedUiLanguages]
            .map(code => `<option value="${code}">${getToolLanguageLabel(code)}</option>`)
            .join('');
    }

    const toolLanguageOptionsHtml = buildToolLanguageOptionsHtml();

    const targetLanguageOptionsHtml = buildTargetLanguageOptions(true);

    const translationBox = document.createElement('div');
    translationBox.style.cssText = `
        position: absolute;
        background: linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%);
        color: #ffffff;
        padding: 20px;
        padding-top: 40px;
        border-radius: 12px;
        z-index: 9999;
        display: none;
        min-width:370px;
        max-width: 420px;
        min-height: 200px;
        max-height: 260px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        #closeButton:hover svg {
  stroke: #ff0000;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

    `;
    document.body.appendChild(translationBox);


    translationBox.innerHTML = `
    <div id="dragHandle" style="position:absolute; top:0; left:0; right:0; height:28px; background: linear-gradient(120deg, #3a3a3f, #4b4b52); border-radius: 12px 12px 0 0; cursor: move; display:flex; align-items:center; gap:8px; padding:0 12px; color:#e5e5e5; font-size:12px; font-weight:600; letter-spacing:0.3px; box-shadow: inset 0 -1px 0 rgba(255,255,255,0.08); user-select: none;">
        <div style="width:44px; height:4px; border-radius:4px; background:rgba(255,255,255,0.4);"></div>
        <span style="opacity:0.9;">${dragHandleLabel}</span>
    </div>
    <div style="
    position: absolute;
    top: 6px;
    right: 8px;
    background: none;
    border: none;
    color: #ff4d4d;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;">
        <div id="closeButton" style="cursor: pointer;" title="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
    </div>
    <div id="settingsHeader" style="position: absolute; top: 34px; left: 8px; display:none; align-items: center; gap: 8px;">
        <div id="backButton" style="cursor: pointer;" title="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <span id="settingsHeaderTitle" style="color:#fff; font-size:14px; font-weight:600; letter-spacing:0.3px;">${settingsTitle}</span>
    </div>

<div id="translatorPanel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;user-select: none;">
        <select id="sourceLang" style="background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 6px; font-size: 13px; cursor: pointer;">
            <option value="auto">Detect language</option>
    ${Object.entries(googleTranslateLanguages).map(([code, name]) =>
        `<option value="${code}">${name}</option>`).join('')}
</select>
        <span style="color: #a0a0c0; margin: 0 8px;">→</span>
        <select id="targetLang"
            style="background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 6px; font-size: 13px; cursor: pointer;">
            ${targetLanguageOptionsHtml}
</select>

    </div>
<div id="translationText"
     style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; min-height: 110px; height: 110px; max-height: 110px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; overflow-y: auto;">
</div>

    <div style="display: flex; justify-content: flex-end; margin-top: 12px; gap: 10px; margin-bottom: 12px;">
        <div id="speakButton" style="position: relative; cursor: pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <div id="speakTooltip"
                style="display: none; position: absolute; bottom: 100%; right: 0; background: rgba(0, 0, 0, 0.8); color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; z-index: 10000;">
                <div id="speakTranslated" style="padding: 6px 10px; cursor: pointer; border-radius:3px; transition: background 0.15s ease;">${tooltips.listenTranslated}</div>
                <div id="speakOriginal" style="padding: 6px 10px; cursor: pointer; border-radius:3px; transition: background 0.15s ease;">${tooltips.listenOriginal}</div>
            </div>
        </div>
        <div id="copyButton" style="cursor: pointer;" title="Copy translation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        </div>
        <div id="settingsButton" style="cursor: pointer;" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                    stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                <path
                    d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                    stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>

        </div>

    </div>
</div>


<div id="settingsPanel" style="display:none; padding:31px 20px 20px; min-height:176px; max-height:200px; min-width:370px; max-width:370px;">

<label for="defaultTranslateLang" style="color:#fff; font-size:14px; display:block; margin-bottom:4px;">
  ${settingsDefaultLabel}
</label>
<select id="defaultTranslateLang" style="display:block; width:100%; max-width:260px; margin:0 auto; padding:5px 6px; border-radius:6px; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:13px;">
  ${targetLanguageOptionsHtml}
</select>

<label for="toolLanguage" style="color:#fff; font-size:14px; display:block; margin:12px 0 4px;">
  ${settingsToolLabel}
</label>
<select id="toolLanguage" style="display:block; width:100%; max-width:260px; margin:0 auto; padding:5px 6px; border-radius:6px; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:13px;">
  ${toolLanguageOptionsHtml}
</select>

</div>



    `;

    const BOX_W = 420;
    const BOX_H = 260;
    const MARGIN = 10;

    function placeBoxAtSelection() {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

        let left = rect.left + scrollX;
        const topBelow = rect.bottom + scrollY + MARGIN;
        const topAbove = rect.top + scrollY - BOX_H - MARGIN;

        const vpLeft = scrollX + MARGIN;
        const vpRight = scrollX + window.innerWidth - MARGIN;
        const vpBottom = scrollY + window.innerHeight - MARGIN;

        if (left + BOX_W > vpRight) left = vpRight - BOX_W;
        if (left < vpLeft) left = vpLeft;

        let top;
        if (topBelow + BOX_H <= vpBottom) {
            top = topBelow;
        } else {
            top = Math.max(topAbove, scrollY + MARGIN);
        }

        translationBox.style.left = `${left}px`;
        translationBox.style.top = `${top}px`;
    }

    const dragHandle = translationBox.querySelector('#dragHandle');
    let isDragging = false;
    let dragStartMouseX = 0;
    let dragStartMouseY = 0;
    let dragStartLeft = 0;
    let dragStartTop = 0;
    let previousUserSelect = '';

    function clampBoxPosition(left, top) {
        const width = translationBox.offsetWidth || BOX_W;
        const height = translationBox.offsetHeight || BOX_H;
        const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const minLeft = scrollX + MARGIN;
        const maxLeft = scrollX + window.innerWidth - width - MARGIN;
        const minTop = scrollY + MARGIN;
        const maxTop = scrollY + window.innerHeight - height - MARGIN;
        return {
            left: Math.min(Math.max(minLeft, left), maxLeft),
            top: Math.min(Math.max(minTop, top), maxTop)
        };
    }

    window.addEventListener('resize', () => {
        if (translationBox.style.display === 'block') placeBoxAtSelection();
    });

    if (dragHandle) {
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = translationBox.getBoundingClientRect();
            const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
            const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
            dragStartMouseX = e.clientX;
            dragStartMouseY = e.clientY;
            dragStartLeft = parseFloat(translationBox.style.left) || rect.left + scrollX;
            dragStartTop = parseFloat(translationBox.style.top) || rect.top + scrollY;
            previousUserSelect = document.body.style.userSelect;
            document.body.style.userSelect = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newLeft = dragStartLeft + (e.clientX - dragStartMouseX);
        const newTop = dragStartTop + (e.clientY - dragStartMouseY);
        const { left, top } = clampBoxPosition(newLeft, newTop);
        translationBox.style.left = `${left}px`;
        translationBox.style.top = `${top}px`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = previousUserSelect;
    });

    const sourceLangSelect = translationBox.querySelector('#sourceLang');
    const targetLangSelect = translationBox.querySelector('#targetLang');
    const translationText = translationBox.querySelector('#translationText');
    const speakButton = translationBox.querySelector('#speakButton');
    const speakTooltip = translationBox.querySelector('#speakTooltip');
    const speakTranslated = translationBox.querySelector('#speakTranslated');
    const speakOriginal = translationBox.querySelector('#speakOriginal');
    const copyButton = translationBox.querySelector('#copyButton');
    const settingsButton = translationBox.querySelector('#settingsButton');
    const backButton = translationBox.querySelector('#backButton');
    const defaultTranslateLangSelect = translationBox.querySelector('#defaultTranslateLang');
    const toolLanguageSelect = translationBox.querySelector('#toolLanguage');
    const defaultTranslateLangLabel = translationBox.querySelector('label[for="defaultTranslateLang"]');
    const toolLanguageLabel = translationBox.querySelector('label[for="toolLanguage"]');
    const sourceAutoOption = sourceLangSelect.querySelector('option[value="auto"]');
    const settingsHeader = translationBox.querySelector('#settingsHeader');
    const settingsHeaderTitle = translationBox.querySelector('#settingsHeaderTitle');

    sourceLangSelect.value = 'auto';

    let currentSelectedText = '';
    let currentTranslatedText = '';
    let detectedSourceLang = 'auto';
    let currentResolvedTargetLang = browserLang;

    function getSelectedText() {
        return window.getSelection().toString().trim();
    }

    function ensureSelectValue(selectEl, lang) {
        if (selectEl.querySelector(`option[value="${lang}"]`)) {
            selectEl.value = lang;
            return lang;
        }
        selectEl.value = defaultTargetLang;
        return defaultTargetLang;
    }

    function getSavedTargetLanguage() {
        const saved = GM_getValue('defaultTranslateLang', defaultTargetLang);
        if (!targetLangSelect.querySelector(`option[value="${saved}"]`)) {
            GM_setValue('defaultTranslateLang', defaultTargetLang);
            return defaultTargetLang;
        }
        return saved;
    }

    function persistDefaultTargetLanguage(lang) {
        const valueToPersist = defaultTranslateLangSelect.querySelector(`option[value="${lang}"]`)
            ? lang
            : defaultTargetLang;
        GM_setValue('defaultTranslateLang', valueToPersist);
        return valueToPersist;
    }

    function applyToolLanguage(preference, { persist = false } = {}) {
        const normalizedSelection = (preference === 'browser' || supportedUiLanguages.includes(preference))
            ? preference
            : 'browser';

        if (persist) {
            GM_setValue('defaultToolLang', normalizedSelection);
        }

        const previousErrors = errors;

        toolLanguagePreference = normalizedSelection;

        const newUiLang = resolveUiLang(normalizedSelection);
        langNames = languageNames[newUiLang];
        errors = langNames.errors;
        tooltips = langNames.tooltips;
        dragHandleLabel = langNames.dragHandleLabel || languageNames.en.dragHandleLabel;
        settingsTitle = langNames.settingsTitle || languageNames.en.settingsTitle;
        settingsDefaultLabel = langNames.settingsDefaultLabel || languageNames.en.settingsDefaultLabel;
        settingsToolLabel = langNames.settingsToolLabel || languageNames.en.settingsToolLabel;

        if (settingsHeaderTitle) settingsHeaderTitle.textContent = settingsTitle;
        if (defaultTranslateLangLabel) defaultTranslateLangLabel.textContent = settingsDefaultLabel;
        if (toolLanguageLabel) toolLanguageLabel.textContent = settingsToolLabel;
        if (settingsButton) settingsButton.title = settingsTitle;

        if (sourceAutoOption) sourceAutoOption.textContent = langNames.auto;

        if (speakTranslated) speakTranslated.textContent = tooltips.listenTranslated;
        if (speakOriginal) speakOriginal.textContent = tooltips.listenOriginal;
        const dragLabelEl = translationBox.querySelector('#dragHandle span');
        if (dragLabelEl) dragLabelEl.textContent = dragHandleLabel;

        if (toolLanguageSelect) {
            toolLanguageSelect.innerHTML = buildToolLanguageOptionsHtml();
            toolLanguageSelect.value = normalizedSelection;
        }

        if (translationText && previousErrors && translationText.textContent === previousErrors.noText) {
            translationText.textContent = errors.noText;
        }

        const currentTargetValue = targetLangSelect.value;
        const savedDefaultValue = GM_getValue('defaultTranslateLang', defaultTargetLang);
        const refreshedTargetOptions = buildTargetLanguageOptions(true);
        targetLangSelect.innerHTML = refreshedTargetOptions;
        ensureSelectValue(targetLangSelect, currentTargetValue);

        defaultTranslateLangSelect.innerHTML = refreshedTargetOptions;
        ensureSelectValue(defaultTranslateLangSelect, savedDefaultValue);
    }

    const initialTargetLang = getSavedTargetLanguage();
    ensureSelectValue(targetLangSelect, initialTargetLang);
    ensureSelectValue(defaultTranslateLangSelect, initialTargetLang);
    currentResolvedTargetLang = initialTargetLang === 'navigator' ? browserLang : initialTargetLang;
    if (toolLanguageSelect) {
        toolLanguageSelect.value = toolLanguagePreference;
    }

    defaultTranslateLangSelect.addEventListener('change', () => {
        const persisted = persistDefaultTargetLanguage(defaultTranslateLangSelect.value);
        ensureSelectValue(targetLangSelect, persisted);
        currentResolvedTargetLang = persisted === 'navigator' ? browserLang : persisted;
        handleLanguageChange();
    });

    if (toolLanguageSelect) {
        toolLanguageSelect.addEventListener('change', () => {
            const selected = toolLanguageSelect.value || 'browser';
            const normalizedSelection = (selected === 'browser' || supportedUiLanguages.includes(selected)) ? selected : 'browser';
            applyToolLanguage(normalizedSelection, { persist: true });
        });
    }

    applyToolLanguage(toolLanguagePreference);



    function splitSentences(text) {
        const regex = /(\.\s+|\.\n|\.)/;
        let parts = text.split(regex);
        let sentences = [];
        let currentSentence = '';

        for (let i = 0; i < parts.length; i++) {
            currentSentence += parts[i];
            if (parts[i].match(regex) || i === parts.length - 1) {
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
                currentSentence = '';
            }
        }

        return sentences.length ? sentences : [text];
    }


    function translateSentence(text, sourceLang, targetLang, callback) {
        if (!text.trim()) {
            callback(text, null);
            return;
        }

        const match = text.match(/([\s\S]*?)(?:(\.\s+|\.\n|\.)|$)/);
        const textToTranslate = match ? (match[1] || text) : text;
        const delimiter = match && match[2] ? match[2] : '';

        function chunkBySize(s, size = 1000) {
            const out = [];
            for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
            return out;
        }


        let sentences = splitSentences(text).flatMap(seg =>
            seg.length > 1000 ? chunkBySize(seg) : [seg]
        );


        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate.trim())}`,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);

                    let detected = sourceLang;
                    if (sourceLang === 'auto') {
                        if (data[2]) {
                            detected = data[2];
                        } else if (data[8] && data[8][0] && data[8][0][0]) {
                            detected = data[8][0][0];
                        } else {
                            detected = '';
                        }
                    }

                    const translation = (data && data[0] && data[0][0] && data[0][0][0])
                        ? data[0][0][0] + delimiter
                        : '' + delimiter;

                    callback(translation, detected || null);
                } catch (e) {
                    callback(errors.translation + delimiter, null);
                }
            },
            onerror: function () {
                callback(errors.connection + delimiter, null);
            }
        });
    }


    function translateText(text, sourceLang, targetLang, callback, position) {
        if (!text) {
            callback(errors.noText, position, null);
            return;
        }

        if (!sourceLang || sourceLang === '') sourceLang = 'auto';

        let resolvedTargetLang = targetLang;
        if (resolvedTargetLang === 'navigator') {
            resolvedTargetLang = browserLang;
        }
        if (!resolvedTargetLang || resolvedTargetLang === '') {
            let fallback = getSavedTargetLanguage();
            if (fallback === 'navigator') fallback = browserLang;
            resolvedTargetLang = fallback || defaultTargetLang;
        }

        const sentences = splitSentences(text);
        let translatedSentences = [];
        let completed = 0;

        let runDetectedLang = null;

        sentences.forEach((sentence, index) => {
            translateSentence(sentence, sourceLang, resolvedTargetLang, (translation, detected) => {
                translatedSentences[index] = translation;

                if (!runDetectedLang && detected && googleTranslateLanguages[detected]) {
                    runDetectedLang = detected;
                }

                completed++;
                if (completed === sentences.length) {
                    if (runDetectedLang && sourceLangSelect.querySelector(`option[value="${runDetectedLang}"]`)) {
                        sourceLangSelect.value = runDetectedLang;
                        detectedSourceLang = runDetectedLang;
                    } else {
                        sourceLangSelect.value = 'auto';
                        detectedSourceLang = 'auto';
                    }

                    const fullTranslation = translatedSentences.join('');
                    callback(fullTranslation, position, resolvedTargetLang);
                }
            });
        });
    }


    function speak(text, lang) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    }


    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'l' && !e.altKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            sourceLangSelect.value = 'auto';
            detectedSourceLang = 'auto';
            const translatorPanel = document.getElementById('translatorPanel');
            const settingsPanel = document.getElementById('settingsPanel');
            if (translatorPanel) translatorPanel.style.display = 'block';
            if (settingsPanel) settingsPanel.style.display = 'none';
            if (settingsHeader) settingsHeader.style.display = 'none';
            const selectedText = getSelectedText();
            if (!selectedText) {
                translationText.textContent = errors.noText;
                translationBox.style.display = 'block';
                translationBox.style.left = `${window.innerWidth / 2 - 150}px`;
                translationBox.style.top = `${window.innerHeight / 2 - 50}px`;
                translationBox.style.opacity = '1';
                translationBox.style.transform = 'translateY(0)';
                return;
            }


            currentSelectedText = selectedText;
            const selection = window.getSelection();
            let position = { x: 0, y: 0 };

            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                position = {
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY
                };
            }

            const savedTargetLang = getSavedTargetLanguage();
            const targetLangForSession = ensureSelectValue(targetLangSelect, savedTargetLang);
            ensureSelectValue(defaultTranslateLangSelect, savedTargetLang);

            translateText(selectedText, 'auto', targetLangForSession, (translation, pos, resolvedTargetLang) => {
                currentTranslatedText = translation;
                translationText.textContent = translation;
                currentResolvedTargetLang = resolvedTargetLang || currentResolvedTargetLang;
                placeBoxAtSelection();
                translationBox.style.display = 'block';
                translationBox.style.opacity = '1';
                translationBox.style.transform = 'translateY(0)';


            }, position);



        }
    });


    function handleLanguageChange() {
        if (currentSelectedText) {
            translateText(currentSelectedText, sourceLangSelect.value, targetLangSelect.value, (translation, pos, resolvedTargetLang) => {
                currentTranslatedText = translation;
                translationText.textContent = translation;
                currentResolvedTargetLang = resolvedTargetLang || currentResolvedTargetLang;
            }, { x: parseFloat(translationBox.style.left), y: parseFloat(translationBox.style.top) });
        }
    }


    sourceLangSelect.addEventListener('change', handleLanguageChange);
    targetLangSelect.addEventListener('change', () => {
        ensureSelectValue(targetLangSelect, targetLangSelect.value);
        handleLanguageChange();
    });

    speakButton.addEventListener('mouseenter', () => {
        speakTooltip.style.display = 'block';
    });
    speakButton.addEventListener('mouseleave', () => {
        speakTooltip.style.display = 'none';
    });

    [speakTranslated, speakOriginal].forEach(el => {
        if (!el) return;
        el.addEventListener('mouseenter', () => {
            el.style.background = 'rgba(255,255,255,0.12)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.background = 'transparent';
        });
    });

    speakTranslated.addEventListener('click', () => {
        if (currentTranslatedText) {
            const langForSpeech = currentResolvedTargetLang || (targetLangSelect.value === 'navigator' ? browserLang : targetLangSelect.value);
            speak(currentTranslatedText, langForSpeech);
        }
    });

    speakOriginal.addEventListener('click', () => {
        if (currentSelectedText) {
            speak(currentSelectedText, detectedSourceLang);
        }
    });

    copyButton.addEventListener('click', () => {
        if (currentTranslatedText) {
            navigator.clipboard.writeText(currentTranslatedText);
            copyButton.querySelector('svg').style.stroke = '#00ff00';
            setTimeout(() => {
                copyButton.querySelector('svg').style.stroke = '#ffffff';
            }, 1000);
        }
    });
    const closeButton = translationBox.querySelector('#closeButton');
    closeButton.addEventListener('click', () => {
        translationBox.style.display = 'none';
        translationBox.style.opacity = '0';
        translationBox.style.transform = 'translateY(10px)';
        sourceLangSelect.value = 'auto';
        detectedSourceLang = 'auto';

        const translatorPanel = document.getElementById('translatorPanel');
        const settingsPanel = document.getElementById('settingsPanel');

        if (translatorPanel) translatorPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (settingsHeader) settingsHeader.style.display = 'none';
    });

    settingsButton.addEventListener('click', () => {
        const translatorPanel = document.getElementById('translatorPanel');
        const settingsPanel = document.getElementById('settingsPanel');

        if (translatorPanel) translatorPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'block';

        if (settingsHeaderTitle) settingsHeaderTitle.textContent = settingsTitle;
        if (settingsHeader) settingsHeader.style.display = 'flex';
    });


    backButton.addEventListener('click', () => {
        const translatorPanel = document.getElementById('translatorPanel');
        const settingsPanel = document.getElementById('settingsPanel');

        if (translatorPanel) translatorPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';

        if (settingsHeader) settingsHeader.style.display = 'none';
    });





    document.addEventListener('mousedown', (e) => {
        if (!translationBox.contains(e.target)) {
            translationBox.style.display = 'none';
            translationBox.style.opacity = '0';
            translationBox.style.transform = 'translateY(10px)';
            sourceLangSelect.value = 'auto';
            detectedSourceLang = 'auto';
            if (settingsHeader) settingsHeader.style.display = 'none';
        }
    });

    function adjustBoxPosition() {
        const rect = translationBox.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            translationBox.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            translationBox.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    }

    translationBox.addEventListener('transitionend', adjustBoxPosition);
})();
