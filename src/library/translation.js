
/*
UTST Translation Library

This file is NOT intended to be used or installed on its own.
It is a shared internal library already connected to the main script.

Do not import or modify this file directly unless you know exactly what you are doing.
*/


// ==UserScript==
// @name         UTST Translation Library
// @description  Central translation library for UTST
// @namespace    https://github.com/DREwX-code
// @author       Dℝ∃wX
// @version      1.0.3
// @license      Apache-2.0
// @grant        none
// ==/UserScript==

/*
Copyright 2025-2026 Dℝ∃wX

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


(function (global) {
    'use strict';

    const supportedUiLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh-CN', 'ja', 'ar', 'hi', 'ko', 'tr', 'nl', 'pl', 'id', 'vi', 'uk', 'he'];

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
            'ar': 'Arabic',
            'hi': 'Hindi',
            'ko': 'Korean',
            'tr': 'Turkish',
            'nl': 'Dutch',
            'pl': 'Polish',
            'id': 'Indonesian',
            'vi': 'Vietnamese',
            'uk': 'Ukrainian',
            'he': 'Hebrew',
            'errors': {
                'noText': 'No text selected',
                'translation': 'Translation error',
                'connection': 'Connection error'
            },
            'tooltips': {
                'listenTranslated': 'Listen to translated text',
                'listenOriginal': 'Listen to original text'
            },
            'themes': {
                'blue': 'Blue',
                'dark': 'Dark',
                'light': 'Light'
            },
            'bubble': {
                'hideSite': 'Hide on this site',
                'hideGlobal': 'Hide globally',
                'closeTitle': 'Hide selection bubble',
                'translateTitle': 'Translate selected text',
                'hideOn': 'Hide on'
            },
            'overlay': {
                'title': 'Fullscreen Translator',
                'source': 'Source text',
                'target': 'Translated text',
                'translate': 'Translate',
                'open': 'Fullscreen',
                'sourceLangLabel': 'Source language',
                'targetLangLabel': 'Target language'
            },
            'dragHandleLabel': 'Move',
            'settingsTitle': 'Settings',
            'settingsDefaultLabel': 'Default translation language:',
            'settingsToolLabel': 'Tool language:',
            'navigator': 'Browser language',
            'settingsThemeLabel': 'Theme:',
            'settingsBubbleLabel': 'Selection Bubble',
            'settingsBlacklistLabel': 'Blacklist',
            'settingsBlacklistAdd': 'Add',
            'settingsBlacklistEmpty': 'No blocked sites.'
        },
        'ar': {
            'auto': 'اكتشاف',
            'en': 'الإنجليزية',
            'fr': 'الفرنسية',
            'es': 'الإسبانية',
            'de': 'الألمانية',
            'it': 'الإيطالية',
            'pt': 'البرتغالية',
            'ru': 'الروسية',
            'zh-CN': 'الصينية (المبسطة)',
            'ja': 'اليابانية',
            'errors': {
                'noText': 'لم يتم تحديد أي نص',
                'translation': 'خطأ في الترجمة',
                'connection': 'خطأ في الاتصال'
            },
            'tooltips': {
                'listenTranslated': 'الاستماع إلى النص المترجم',
                'listenOriginal': 'الاستماع إلى النص الأصلي'
            },
            'themes': {
                'blue': 'أزرق',
                'dark': 'داكن',
                'light': 'فاتح'
            },
            'bubble': {
                'hideSite': 'إخفاء على هذا الموقع',
                'hideGlobal': 'إخفاء عالميًا',
                'closeTitle': 'إخفاء فقاعة التحديد',
                'translateTitle': 'ترجمة النص المحدد',
                'hideOn': 'إخفاء على'
            },
            'overlay': {
                'title': 'مترجم ملء الشاشة',
                'source': 'النص المصدر',
                'target': 'النص المترجم',
                'translate': 'ترجمة',
                'open': 'ملء الشاشة',
                'sourceLangLabel': 'لغة المصدر',
                'targetLangLabel': 'اللغة المستهدفة'
            },
            'dragHandleLabel': 'نقل',
            'settingsTitle': 'إعدادات',
            'settingsDefaultLabel': 'لغة الترجمة الافتراضية:',
            'settingsToolLabel': 'لغة الأداة:',
            'navigator': 'لغة المتصفح',
            'ar': 'العربية',
            'hi': 'الهندية',
            'ko': 'الكورية',
            'tr': 'التركية',
            'nl': 'الهولندية',
            'pl': 'البولندية',
            'id': 'الإندونيسية',
            'vi': 'الفيتنامية',
            'uk': 'الأوكرانية',
            'he': 'العبرية',
            'settingsThemeLabel': 'سمة:',
            'settingsBubbleLabel': 'فقاعة الاختيار',
            'settingsBlacklistLabel': 'القائمة السوداء',
            'settingsBlacklistAdd': 'يضيف',
            'settingsBlacklistEmpty': 'لا توجد مواقع محجوبة.'
        },
        'hi': {
            'auto': 'पता लगाएं',
            'en': 'अंग्रेजी',
            'fr': 'फ़्रेंच',
            'es': 'स्पैनिश',
            'de': 'जर्मन',
            'it': 'इतालवी',
            'pt': 'पुर्तगाली',
            'ru': 'रूसी',
            'zh-CN': 'सरलीकृत चीनी',
            'ja': 'जापानी',
            'errors': {
                'noText': 'कोई पाठ चयनित नहीं',
                'translation': 'अनुवाद त्रुटि',
                'connection': 'कनेक्शन त्रुटि'
            },
            'tooltips': {
                'listenTranslated': 'अनुवादित पाठ सुनें',
                'listenOriginal': 'मूल पाठ सुनें'
            },
            'themes': {
                'blue': 'नीला',
                'dark': 'गहरा',
                'light': 'हल्का'
            },
            'bubble': {
                'hideSite': 'इस साइट पर छिपाएँ',
                'hideGlobal': 'हर जगह छिपाएँ',
                'closeTitle': 'चयन बबल छिपाएँ',
                'translateTitle': 'चयनित पाठ का अनुवाद करें',
                'hideOn': 'इस पर छिपाएँ'
            },
            'overlay': {
                'title': 'पूर्ण स्क्रीन अनुवादक',
                'source': 'स्रोत पाठ',
                'target': 'अनुवादित पाठ',
                'translate': 'अनुवाद',
                'open': 'पूर्ण स्क्रीन',
                'sourceLangLabel': 'स्रोत भाषा',
                'targetLangLabel': 'लक्ष्य भाषा'
            },
            'dragHandleLabel': 'स्थानांतरित करें',
            'settingsTitle': 'सेटिंग्स',
            'settingsDefaultLabel': 'डिफ़ॉल्ट अनुवाद भाषा:',
            'settingsToolLabel': 'उपकरण भाषा:',
            'navigator': 'ब्राउज़र भाषा',
            'ar': 'अरबी',
            'hi': 'हिन्दी',
            'ko': 'कोरियाई',
            'tr': 'तुर्की',
            'nl': 'डच',
            'pl': 'पोलिश',
            'id': 'इंडोनेशियाई',
            'vi': 'वियतनामी',
            'uk': 'यूक्रेनियाई',
            'he': 'हिब्रू',
            'settingsThemeLabel': 'विषय:',
            'settingsBubbleLabel': 'चयन बुलबुला',
            'settingsBlacklistLabel': 'काला सूची में डालना',
            'settingsBlacklistAdd': 'जोड़ना',
            'settingsBlacklistEmpty': 'कोई अवरुद्ध साइटें नहीं.'
        },
        'ko': {
            'auto': '감지',
            'en': '영어',
            'fr': '프랑스어',
            'es': '스페인어',
            'de': '독일어',
            'it': '이탈리아어',
            'pt': '포르투갈어',
            'ru': '러시아어',
            'zh-CN': '중국어(간체)',
            'ja': '일본어',
            'errors': {
                'noText': '선택한 텍스트가 없습니다',
                'translation': '번역 오류',
                'connection': '연결 오류'
            },
            'tooltips': {
                'listenTranslated': '번역된 텍스트 듣기',
                'listenOriginal': '원본 텍스트 듣기'
            },
            'themes': {
                'blue': '파란색',
                'dark': '어두운',
                'light': '밝은'
            },
            'bubble': {
                'hideSite': '이 사이트에서 숨기기',
                'hideGlobal': '전체에서 숨기기',
                'closeTitle': '선택 버블 숨기기',
                'translateTitle': '선택한 텍스트 번역',
                'hideOn': '다음 사이트에서 숨기기'
            },
            'overlay': {
                'title': '전체 화면 번역기',
                'source': '원본 텍스트',
                'target': '번역된 텍스트',
                'translate': '번역',
                'open': '전체 화면',
                'sourceLangLabel': '소스 언어',
                'targetLangLabel': '대상 언어'
            },
            'dragHandleLabel': '이동',
            'settingsTitle': '설정',
            'settingsDefaultLabel': '기본 번역 언어:',
            'settingsToolLabel': '도구 언어:',
            'navigator': '브라우저 언어',
            'ar': '아랍어',
            'hi': '힌디어',
            'ko': '한국어',
            'tr': '터키어',
            'nl': '네덜란드어',
            'pl': '폴란드어',
            'id': '인도네시아어',
            'vi': '베트남어',
            'uk': '우크라이나어',
            'he': '히브리어',
            'settingsThemeLabel': '주제:',
            'settingsBubbleLabel': '선택 버블',
            'settingsBlacklistLabel': '블랙리스트',
            'settingsBlacklistAdd': '추가하다',
            'settingsBlacklistEmpty': '차단된 사이트가 없습니다.'
        },
        'tr': {
            'auto': 'Algıla',
            'en': 'İngilizce',
            'fr': 'Fransızca',
            'es': 'İspanyolca',
            'de': 'Almanca',
            'it': 'İtalyanca',
            'pt': 'Portekizce',
            'ru': 'Rusça',
            'zh-CN': 'Çince (Basitleştirilmiş)',
            'ja': 'Japonca',
            'errors': {
                'noText': 'Metin seçilmedi',
                'translation': 'Çeviri hatası',
                'connection': 'Bağlantı hatası'
            },
            'tooltips': {
                'listenTranslated': 'Çevrilmiş metni dinle',
                'listenOriginal': 'Orijinal metni dinle'
            },
            'themes': {
                'blue': 'Mavi',
                'dark': 'Koyu',
                'light': 'Açık'
            },
            'bubble': {
                'hideSite': 'Bu sitede gizle',
                'hideGlobal': 'Her yerde gizle',
                'closeTitle': 'Seçim balonunu gizle',
                'translateTitle': 'Seçili metni çevir',
                'hideOn': 'Şurada gizle'
            },
            'overlay': {
                'title': 'Tam ekran çevirmen',
                'source': 'Kaynak metin',
                'target': 'Çevrilmiş metin',
                'translate': 'Çevir',
                'open': 'Tam ekran',
                'sourceLangLabel': 'Kaynak dil',
                'targetLangLabel': 'Hedef dil'
            },
            'dragHandleLabel': 'Taşı',
            'settingsTitle': 'Ayarlar',
            'settingsDefaultLabel': 'Varsayılan çeviri dili:',
            'settingsToolLabel': 'Araç dili:',
            'navigator': 'Tarayıcı dili',
            'ar': 'Arapça',
            'hi': 'Hintçe',
            'ko': 'Korece',
            'tr': 'Türkçe',
            'nl': 'Felemenkçe',
            'pl': 'Lehçe',
            'id': 'Endonezce',
            'vi': 'Vietnamca',
            'uk': 'Ukraynaca',
            'he': 'İbranice',
            'settingsThemeLabel': 'Tema:',
            'settingsBubbleLabel': 'Seçim Balonu',
            'settingsBlacklistLabel': 'Kara liste',
            'settingsBlacklistAdd': 'Eklemek',
            'settingsBlacklistEmpty': 'Engellenen site yok.'
        },
        'nl': {
            'auto': 'Detecteer',
            'en': 'Engels',
            'fr': 'Frans',
            'es': 'Spaans',
            'de': 'Duits',
            'it': 'Italiaans',
            'pt': 'Portugees',
            'ru': 'Russisch',
            'zh-CN': 'Chinees (vereenvoudigd)',
            'ja': 'Japans',
            'errors': {
                'noText': 'Geen tekst geselecteerd',
                'translation': 'Vertaalfout',
                'connection': 'Verbindingsfout'
            },
            'tooltips': {
                'listenTranslated': 'Luister naar vertaalde tekst',
                'listenOriginal': 'Luister naar de originele tekst'
            },
            'themes': {
                'blue': 'Blauw',
                'dark': 'Donker',
                'light': 'Licht'
            },
            'bubble': {
                'hideSite': 'Verbergen op deze site',
                'hideGlobal': 'Overal verbergen',
                'closeTitle': 'Selectieballon verbergen',
                'translateTitle': 'Geselecteerde tekst vertalen',
                'hideOn': 'Verbergen op'
            },
            'overlay': {
                'title': 'Vertaler op volledig scherm',
                'source': 'Brontekst',
                'target': 'Vertaald tekst',
                'translate': 'Vertalen',
                'open': 'Volledig scherm',
                'sourceLangLabel': 'Brontaal',
                'targetLangLabel': 'Doeltaal'
            },
            'dragHandleLabel': 'Verplaats',
            'settingsTitle': 'Instellingen',
            'settingsDefaultLabel': 'Standaard vertalingstaal:',
            'settingsToolLabel': 'Gereedschapstaal:',
            'navigator': 'Browsertaal',
            'ar': 'Arabisch',
            'hi': 'Hindi',
            'ko': 'Koreaans',
            'tr': 'Turks',
            'nl': 'Nederlands',
            'pl': 'Pools',
            'id': 'Indonesisch',
            'vi': 'Vietnamees',
            'uk': 'Oekraïens',
            'he': 'Hebreeuws',
            'settingsThemeLabel': 'Thema:',
            'settingsBubbleLabel': 'Selectiebel',
            'settingsBlacklistLabel': 'Zwarte lijst',
            'settingsBlacklistAdd': 'Toevoegen',
            'settingsBlacklistEmpty': 'Geen geblokkeerde sites.'
        },
        'pl': {
            'auto': 'Wykryj',
            'en': 'Angielski',
            'fr': 'Francuski',
            'es': 'Hiszpański',
            'de': 'Niemiecki',
            'it': 'Włoski',
            'pt': 'Portugalski',
            'ru': 'Rosyjski',
            'zh-CN': 'Chiński (uproszczony)',
            'ja': 'Japoński',
            'errors': {
                'noText': 'Nie wybrano tekstu',
                'translation': 'Błąd tłumaczenia',
                'connection': 'Błąd połączenia'
            },
            'tooltips': {
                'listenTranslated': 'Odtwórz przetłumaczony tekst',
                'listenOriginal': 'Odtwórz tekst źródłowy'
            },
            'themes': {
                'blue': 'Niebieski',
                'dark': 'Ciemny',
                'light': 'Jasny'
            },
            'bubble': {
                'hideSite': 'Ukryj na tej stronie',
                'hideGlobal': 'Ukryj globalnie',
                'closeTitle': 'Ukryj dymek zaznaczenia',
                'translateTitle': 'Przetłumacz zaznaczony tekst',
                'hideOn': 'Ukryj na'
            },
            'overlay': {
                'title': 'Tłumacz pełnoekranowy',
                'source': 'Tekst źródłowy',
                'target': 'Tekst tłumaczenia',
                'translate': 'Tłumacz',
                'open': 'Pełny ekran',
                'sourceLangLabel': 'Język źródłowy',
                'targetLangLabel': 'Język docelowy'
            },
            'dragHandleLabel': 'Przenieś',
            'settingsTitle': 'Ustawienia',
            'settingsDefaultLabel': 'Domyślny język tłumaczenia:',
            'settingsToolLabel': 'Język narzędzia:',
            'navigator': 'Język przeglądarki',
            'ar': 'arabski',
            'hi': 'hindi',
            'ko': 'koreański',
            'tr': 'turecki',
            'nl': 'niderlandzki',
            'pl': 'polski',
            'id': 'indonezyjski',
            'vi': 'wietnamski',
            'uk': 'ukraiński',
            'he': 'hebrajski',
            'settingsThemeLabel': 'Temat:',
            'settingsBubbleLabel': 'Bańka wyboru',
            'settingsBlacklistLabel': 'Czarna lista',
            'settingsBlacklistAdd': 'Dodać',
            'settingsBlacklistEmpty': 'Brak zablokowanych witryn.'
        },
        'id': {
            'auto': 'Deteksi',
            'en': 'Inggris',
            'fr': 'Prancis',
            'es': 'Spanyol',
            'de': 'Jerman',
            'it': 'Italia',
            'pt': 'Portugis',
            'ru': 'Rusia',
            'zh-CN': 'China (Sederhana)',
            'ja': 'Jepang',
            'errors': {
                'noText': 'Tidak ada teks yang dipilih',
                'translation': 'Kesalahan terjemahan',
                'connection': 'Kesalahan koneksi'
            },
            'tooltips': {
                'listenTranslated': 'Dengarkan teks terjemahan',
                'listenOriginal': 'Dengarkan teks asli'
            },
            'themes': {
                'blue': 'Biru',
                'dark': 'Gelap',
                'light': 'Terang'
            },
            'bubble': {
                'hideSite': 'Sembunyikan di situs ini',
                'hideGlobal': 'Sembunyikan secara global',
                'closeTitle': 'Sembunyikan gelembung seleksi',
                'translateTitle': 'Terjemahkan teks yang dipilih',
                'hideOn': 'Sembunyikan di'
            },
            'overlay': {
                'title': 'Penerjemah Layar Penuh',
                'source': 'Teks sumber',
                'target': 'Teks terjemahan',
                'translate': 'Terjemahkan',
                'open': 'Layar penuh',
                'sourceLangLabel': 'Bahasa sumber',
                'targetLangLabel': 'Bahasa target'
            },
            'dragHandleLabel': 'Pindahkan',
            'settingsTitle': 'Pengaturan',
            'settingsDefaultLabel': 'Bahasa terjemahan bawaan:',
            'settingsToolLabel': 'Bahasa alat:',
            'navigator': 'Bahasa browser',
            'ar': 'Arab',
            'hi': 'Hindi',
            'ko': 'Korea',
            'tr': 'Turki',
            'nl': 'Belanda',
            'pl': 'Polski',
            'id': 'Indonesia',
            'vi': 'Vietnam',
            'uk': 'Ukraina',
            'he': 'Ibrani',
            'settingsThemeLabel': 'Tema:',
            'settingsBubbleLabel': 'Gelembung Seleksi',
            'settingsBlacklistLabel': 'Daftar Hitam',
            'settingsBlacklistAdd': 'Menambahkan',
            'settingsBlacklistEmpty': 'Tidak ada situs yang diblokir.'
        },
        'vi': {
            'auto': 'Phát hiện',
            'en': 'Tiếng Anh',
            'fr': 'Tiếng Pháp',
            'es': 'Tiếng Tây Ban Nha',
            'de': 'Tiếng Đức',
            'it': 'Tiếng Ý',
            'pt': 'Tiếng Bồ Đào Nha',
            'ru': 'Tiếng Nga',
            'zh-CN': 'Tiếng Trung (Giản thể)',
            'ja': 'Tiếng Nhật',
            'errors': {
                'noText': 'Không có văn bản được chọn',
                'translation': 'Lỗi dịch',
                'connection': 'Lỗi kết nối'
            },
            'tooltips': {
                'listenTranslated': 'Nghe văn bản đã dịch',
                'listenOriginal': 'Nghe văn bản gốc'
            },
            'themes': {
                'blue': 'Xanh dương',
                'dark': 'Tối',
                'light': 'Sáng'
            },
            'bubble': {
                'hideSite': 'Ẩn trên trang web này',
                'hideGlobal': 'Ẩn trên tất cả trang web',
                'closeTitle': 'Ẩn bong bóng chọn văn bản',
                'translateTitle': 'Dịch văn bản đã chọn',
                'hideOn': 'Ẩn trên'
            },
            'overlay': {
                'title': 'Trình dịch toàn màn hình',
                'source': 'Văn bản nguồn',
                'target': 'Văn bản dịch',
                'translate': 'Dịch',
                'open': 'Toàn màn hình',
                'sourceLangLabel': 'Ngôn ngữ nguồn',
                'targetLangLabel': 'Ngôn ngữ đích'
            },
            'dragHandleLabel': 'Di chuyển',
            'settingsTitle': 'Cài đặt',
            'settingsDefaultLabel': 'Ngôn ngữ dịch mặc định:',
            'settingsToolLabel': 'Ngôn ngữ công cụ:',
            'navigator': 'Ngôn ngữ trình duyệt',
            'ar': 'Tiếng Ả Rập',
            'hi': 'Tiếng Hindi',
            'ko': 'Tiếng Hàn',
            'tr': 'Tiếng Thổ Nhĩ Kỳ',
            'nl': 'Tiếng Hà Lan',
            'pl': 'Tiếng Ba Lan',
            'id': 'Tiếng Indonesia',
            'vi': 'Tiếng Việt',
            'uk': 'Tiếng Ukraina',
            'he': 'Tiếng Do Thái',
            'settingsThemeLabel': 'chủ đề:',
            'settingsBubbleLabel': 'Bong bóng lựa chọn',
            'settingsBlacklistLabel': 'Danh sách đen',
            'settingsBlacklistAdd': 'Thêm vào',
            'settingsBlacklistEmpty': 'Không có trang web bị chặn.'
        },
        'uk': {
            'auto': 'Визначити',
            'en': 'Англійська',
            'fr': 'Французька',
            'es': 'Іспанська',
            'de': 'Німецька',
            'it': 'Італійська',
            'pt': 'Португальська',
            'ru': 'Російська',
            'zh-CN': 'Китайська (спрощена)',
            'ja': 'Японська',
            'errors': {
                'noText': 'Текст не вибрано',
                'translation': 'Помилка перекладу',
                'connection': 'Помилка з’єднання'
            },
            'tooltips': {
                'listenTranslated': 'Прослухати перекладений текст',
                'listenOriginal': 'Прослухати оригінальний текст'
            },
            'themes': {
                'blue': 'Синій',
                'dark': 'Темний',
                'light': 'Світлий'
            },
            'bubble': {
                'hideSite': 'Приховати на цьому сайті',
                'hideGlobal': 'Приховати всюди',
                'closeTitle': 'Приховати бульбашку виділення',
                'translateTitle': 'Перекласти вибраний текст',
                'hideOn': 'Приховати на'
            },
            'overlay': {
                'title': 'Перекладач на весь екран',
                'source': 'Вихідний текст',
                'target': 'Перекладений текст',
                'translate': 'Перекласти',
                'open': 'Повний екран',
                'sourceLangLabel': 'Мова джерела',
                'targetLangLabel': 'Мова перекладу'
            },
            'dragHandleLabel': 'Перемістити',
            'settingsTitle': 'Налаштування',
            'settingsDefaultLabel': 'Мова перекладу за замовчуванням:',
            'settingsToolLabel': 'Мова інструмента:',
            'navigator': 'Мова браузера',
            'ar': 'арабська',
            'hi': 'гінді',
            'ko': 'корейська',
            'tr': 'турецька',
            'nl': 'нідерландська',
            'pl': 'польська',
            'id': 'індонезійська',
            'vi': 'вʼєтнамська',
            'uk': 'українська',
            'he': 'іврит',
            'settingsThemeLabel': 'Тема:',
            'settingsBubbleLabel': 'Вибір бульбашка',
            'settingsBlacklistLabel': 'Чорний список',
            'settingsBlacklistAdd': 'додати',
            'settingsBlacklistEmpty': 'Немає заблокованих сайтів.'
        },
        'he': {
            'auto': 'זיהוי',
            'en': 'אנגלית',
            'fr': 'צרפתית',
            'es': 'ספרדית',
            'de': 'גרמנית',
            'it': 'איטלקית',
            'pt': 'פורטוגזית',
            'ru': 'רוסית',
            'zh-CN': 'סינית (מפושטת)',
            'ja': 'יפנית',
            'errors': {
                'noText': 'לא נבחר טקסט',
                'translation': 'שגיאת תרגום',
                'connection': 'שגיאת חיבור'
            },
            'tooltips': {
                'listenTranslated': 'האזן לטקסט המתורגם',
                'listenOriginal': 'האזן לטקסט המקורי'
            },
            'themes': {
                'blue': 'כחול',
                'dark': 'כהה',
                'light': 'בהיר'
            },
            'bubble': {
                'hideSite': 'הסתר באתר זה',
                'hideGlobal': 'הסתר בכל האתרים',
                'closeTitle': 'הסתר את בועת הבחירה',
                'translateTitle': 'תרגם את הטקסט שנבחר',
                'hideOn': 'הסתר ב'
            },
            'overlay': {
                'title': 'מתרגם במסך מלא',
                'source': 'טקסט מקור',
                'target': 'טקסט מתורגם',
                'translate': 'תרגם',
                'open': 'מסך מלא',
                'sourceLangLabel': 'שפת מקור',
                'targetLangLabel': 'שפת יעד'
            },
            'dragHandleLabel': 'הזז',
            'settingsTitle': 'הגדרות',
            'settingsDefaultLabel': 'שפת תרגום ברירת מחדל:',
            'settingsToolLabel': 'שפת הכלי:',
            'navigator': 'שפת הדפדפן',
            'ar': 'ערבית',
            'hi': 'הינדי',
            'ko': 'קוריאנית',
            'tr': 'טורקית',
            'nl': 'הולנדית',
            'pl': 'פולנית',
            'id': 'אינדונזית',
            'vi': 'וייטנאמית',
            'uk': 'אוקראינית',
            'he': 'עברית',
            'settingsThemeLabel': 'נוֹשֵׂא:',
            'settingsBubbleLabel': 'בועת בחירה',
            'settingsBlacklistLabel': 'רשימה שחורה',
            'settingsBlacklistAdd': 'לְהוֹסִיף',
            'settingsBlacklistEmpty': 'אין אתרים חסומים.'
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
            'themes': {
                'blue': 'Bleu',
                'dark': 'Sombre',
                'light': 'Clair'
            },
            'bubble': {
                'hideSite': 'Masquer sur ce site',
                'hideGlobal': 'Masquer partout',
                'closeTitle': 'Masquer la bulle',
                'translateTitle': 'Traduire la sélection',
                'hideOn': 'Masquer sur'
            },
            'overlay': {
                'title': 'Traduction plein écran',
                'source': 'Texte source',
                'target': 'Texte traduit',
                'translate': 'Traduire',
                'open': 'Plein écran',
                'sourceLangLabel': 'Langue source',
                'targetLangLabel': 'Langue cible'
            },
            'dragHandleLabel': 'Déplacer',
            'settingsTitle': 'Paramètres',
            'settingsDefaultLabel': 'Langue de traduction par défaut :',
            'settingsToolLabel': 'Langue de l\'outil :',
            'navigator': 'Langue du navigateur',
            'settingsThemeLabel': 'Thème :',
            'settingsBubbleLabel': 'Bulle de sélection',
            'settingsBlacklistLabel': 'Liste noire',
            'settingsBlacklistAdd': 'Ajouter',
            'settingsBlacklistEmpty': 'Aucun site bloqué.',
            'ar': 'arabe',
            'hi': 'hindi',
            'ko': 'coréen',
            'tr': 'turc',
            'nl': 'néerlandais',
            'pl': 'polonais',
            'id': 'indonésien',
            'vi': 'vietnamien',
            'uk': 'ukrainien',
            'he': 'hébreu'
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
            'themes': {
                'blue': 'Azul',
                'dark': 'Oscuro',
                'light': 'Claro'
            },
            'bubble': {
                'hideSite': 'Ocultar en este sitio',
                'hideGlobal': 'Ocultar globalmente',
                'closeTitle': 'Ocultar burbuja',
                'translateTitle': 'Traducir selección',
                'hideOn': 'Ocultar en'
            },
            'dragHandleLabel': 'Mover',
            'settingsTitle': 'Configuración',
            'settingsDefaultLabel': 'Idioma de traducción predeterminado:',
            'settingsToolLabel': 'Idioma de la interfaz:',
            'navigator': 'Idioma del navegador',
            'settingsThemeLabel': 'Tema:',
            'settingsBubbleLabel': 'Burbuja de selección',
            'settingsBlacklistLabel': 'Lista negra',
            'settingsBlacklistAdd': 'Añadir',
            'settingsBlacklistEmpty': 'No hay sitios bloqueados.',
            'ar': 'árabe',
            'hi': 'hindi',
            'ko': 'coreano',
            'tr': 'turco',
            'nl': 'neerlandés',
            'pl': 'polaco',
            'id': 'indonesio',
            'vi': 'vietnamita',
            'uk': 'ucraniano',
            'he': 'hebreo',
            'overlay': {
                'title': 'Traductor de pantalla completa',
                'source': 'Texto fuente',
                'target': 'Texto traducido',
                'translate': 'Traducir',
                'open': 'Pantalla completa',
                'sourceLangLabel': 'Idioma de origen',
                'targetLangLabel': 'Lengua de llegada'
            }
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
            'themes': {
                'blue': 'Blau',
                'dark': 'Dunkel',
                'light': 'Hell'
            },
            'bubble': {
                'hideSite': 'Auf dieser Website ausblenden',
                'hideGlobal': 'Überall ausblenden',
                'closeTitle': 'Auswahlblase ausblenden',
                'translateTitle': 'Ausgewählten Text übersetzen',
                'hideOn': 'Ausblenden auf'
            },
            'dragHandleLabel': 'Verschieben',
            'settingsTitle': 'Einstellungen',
            'settingsDefaultLabel': 'Standardübersetzungssprache:',
            'settingsToolLabel': 'Werkzeugsprache:',
            'navigator': 'Browser-Sprache',
            'ar': 'Arabisch',
            'hi': 'Hindi',
            'ko': 'Koreanisch',
            'tr': 'Türkisch',
            'nl': 'Niederländisch',
            'pl': 'Polnisch',
            'id': 'Indonesisch',
            'vi': 'Vietnamesisch',
            'uk': 'Ukrainisch',
            'he': 'Hebräisch',
            'overlay': {
                'title': 'Vollbild-Übersetzer',
                'source': 'Quelltext',
                'target': 'Übersetzter Text',
                'translate': 'Übersetzen',
                'open': 'Vollbild',
                'sourceLangLabel': 'Ausgangssprache',
                'targetLangLabel': 'Zielsprache'
            },
            'settingsThemeLabel': 'Thema:',
            'settingsBubbleLabel': 'Auswahlblase',
            'settingsBlacklistLabel': 'Schwarze Liste',
            'settingsBlacklistAdd': 'Hinzufügen',
            'settingsBlacklistEmpty': 'Keine blockierten Seiten.'
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
            'themes': {
                'blue': 'Blu',
                'dark': 'Scuro',
                'light': 'Chiaro'
            },
            'bubble': {
                'hideSite': 'Nascondi su questo sito',
                'hideGlobal': 'Nascondi ovunque',
                'closeTitle': 'Nascondi bolla di selezione',
                'translateTitle': 'Traduci il testo selezionato',
                'hideOn': 'Nascondi su'
            },
            'dragHandleLabel': 'Spostare',
            'settingsTitle': 'Impostazioni',
            'settingsDefaultLabel': 'Lingua di traduzione predefinita:',
            'settingsToolLabel': 'Lingua dell\'interfaccia:',
            'navigator': 'Lingua del browser',
            'ar': 'arabo',
            'hi': 'hindi',
            'ko': 'coreano',
            'tr': 'turco',
            'nl': 'olandese',
            'pl': 'polacco',
            'id': 'indonesiano',
            'vi': 'vietnamita',
            'uk': 'ucraino',
            'he': 'ebraico',
            'overlay': {
                'title': 'Traduttore a schermo intero',
                'source': 'Testo di origine',
                'target': 'Testo tradotto',
                'translate': 'Tradurre',
                'open': 'A schermo intero',
                'sourceLangLabel': 'Lingua di partenza',
                'targetLangLabel': 'Lingua di destinazione'
            },
            'settingsThemeLabel': 'Tema:',
            'settingsBubbleLabel': 'Bolla di selezione',
            'settingsBlacklistLabel': 'Lista nera',
            'settingsBlacklistAdd': 'Aggiungere',
            'settingsBlacklistEmpty': 'Nessun sito bloccato.'
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
            'themes': {
                'blue': 'Azul',
                'dark': 'Escuro',
                'light': 'Claro'
            },
            'bubble': {
                'hideSite': 'Ocultar neste site',
                'hideGlobal': 'Ocultar globalmente',
                'closeTitle': 'Ocultar bolha de seleção',
                'translateTitle': 'Traduzir texto selecionado',
                'hideOn': 'Ocultar em'
            },
            'dragHandleLabel': 'Mover',
            'settingsTitle': 'Configurações',
            'settingsDefaultLabel': 'Idioma de tradução padrão:',
            'settingsToolLabel': 'Idioma da interface:',
            'navigator': 'Idioma do navegador',
            'ar': 'árabe',
            'hi': 'híndi',
            'ko': 'coreano',
            'tr': 'turco',
            'nl': 'holandês',
            'pl': 'polonês',
            'id': 'indonésio',
            'vi': 'vietnamita',
            'uk': 'ucraniano',
            'he': 'hebraico',
            'overlay': {
                'title': 'Tradutor de tela cheia',
                'source': 'Texto fonte',
                'target': 'Texto traduzido',
                'translate': 'Traduzir',
                'open': 'Tela cheia',
                'sourceLangLabel': 'Idioma de origem',
                'targetLangLabel': 'Idioma alvo'
            },
            'settingsThemeLabel': 'Tema:',
            'settingsBubbleLabel': 'Bolha de seleção',
            'settingsBlacklistLabel': 'Lista negra',
            'settingsBlacklistAdd': 'Adicionar',
            'settingsBlacklistEmpty': 'Nenhum site bloqueado.'
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
            'themes': {
                'blue': 'Синий',
                'dark': 'Тёмный',
                'light': 'Светлый'
            },
            'bubble': {
                'hideSite': 'Скрыть на этом сайте',
                'hideGlobal': 'Скрыть везде',
                'closeTitle': 'Скрыть пузырь выделения',
                'translateTitle': 'Перевести выделенный текст',
                'hideOn': 'Скрыть на'
            },
            'dragHandleLabel': 'Переместить',
            'settingsTitle': 'Настройки',
            'settingsDefaultLabel': 'Язык перевода по умолчанию:',
            'settingsToolLabel': 'Язык интерфейса:',
            'navigator': 'Язык браузера',
            'ar': 'арабский',
            'hi': 'хинди',
            'ko': 'корейский',
            'tr': 'турецкий',
            'nl': 'нидерландский',
            'pl': 'польский',
            'id': 'индонезийский',
            'vi': 'вьетнамский',
            'uk': 'украинский',
            'he': 'иврит',
            'overlay': {
                'title': 'Полноэкранный переводчик',
                'source': 'Исходный текст',
                'target': 'Переведенный текст',
                'translate': 'Переводить',
                'open': 'Полноэкранный',
                'sourceLangLabel': 'Исходный язык',
                'targetLangLabel': 'Целевой язык'
            },
            'settingsThemeLabel': 'Тема:',
            'settingsBubbleLabel': 'Пузырь выбора',
            'settingsBlacklistLabel': 'Черный список',
            'settingsBlacklistAdd': 'Добавлять',
            'settingsBlacklistEmpty': 'Никаких заблокированных сайтов.'
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
            'themes': {
                'blue': '蓝色',
                'dark': '深色',
                'light': '浅色'
            },
            'bubble': {
                'hideSite': '在此网站隐藏',
                'hideGlobal': '全局隐藏',
                'closeTitle': '隐藏选择气泡',
                'translateTitle': '翻译所选文本',
                'hideOn': '隐藏于'
            },
            'dragHandleLabel': '移动',
            'settingsTitle': '设置',
            'settingsDefaultLabel': '默认翻译语言：',
            'settingsToolLabel': '界面语言：',
            'navigator': '浏览器语言',
            'ar': '阿拉伯语',
            'hi': '印地语',
            'ko': '韩语',
            'tr': '土耳其语',
            'nl': '荷兰语',
            'pl': '波兰语',
            'id': '印度尼西亚语',
            'vi': '越南语',
            'uk': '乌克兰语',
            'he': '希伯来语',
            'overlay': {
                'title': '全屏翻译器',
                'source': '源文本',
                'target': '翻译文本',
                'translate': '翻译',
                'open': '全屏',
                'sourceLangLabel': '源语言',
                'targetLangLabel': '目标语言'
            },
            'settingsThemeLabel': '主题：',
            'settingsBubbleLabel': '选择气泡',
            'settingsBlacklistLabel': '黑名单',
            'settingsBlacklistAdd': '添加',
            'settingsBlacklistEmpty': '没有被封锁的网站。'
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
            'themes': {
                'blue': 'ブルー',
                'dark': 'ダーク',
                'light': 'ライト'
            },
            'bubble': {
                'hideSite': 'このサイトで非表示',
                'hideGlobal': '全体で非表示',
                'closeTitle': '選択バブルを非表示',
                'translateTitle': '選択したテキストを翻訳',
                'hideOn': '非表示'
            },
            'dragHandleLabel': '移動',
            'settingsTitle': '設定',
            'settingsDefaultLabel': '既定の翻訳言語：',
            'settingsToolLabel': 'ツールの言語：',
            'navigator': 'ブラウザの言語',
            'ar': 'アラビア語',
            'hi': 'ヒンディー語',
            'ko': '韓国語',
            'tr': 'トルコ語',
            'nl': 'オランダ語',
            'pl': 'ポーランド語',
            'id': 'インドネシア語',
            'vi': 'ベトナム語',
            'uk': 'ウクライナ語',
            'he': 'ヘブライ語',
            'overlay': {
                'title': 'フルスクリーン翻訳者',
                'source': 'ソーステキスト',
                'target': '翻訳されたテキスト',
                'translate': '翻訳する',
                'open': '全画面表示',
                'sourceLangLabel': 'ソース言語',
                'targetLangLabel': '対象言語'
            },
            'settingsThemeLabel': 'テーマ：',
            'settingsBubbleLabel': '選択バブル',
            'settingsBlacklistLabel': 'ブラックリスト',
            'settingsBlacklistAdd': '追加',
            'settingsBlacklistEmpty': 'ブロックされたサイトはありません。'
        }
    };



    const library = {
        supportedUiLanguages,
        languageNames
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = library;
    }

    if (global) {
        global.TraductionOutilTranslator = library;
    }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
