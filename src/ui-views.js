export function createTranslationBoxView({
    documentRef,
    root,
    logoUrl,
    dragHandleLabel,
    settingsTitle,
    googleTranslateLanguages,
    targetLanguageOptionsHtml,
    overlayLabels,
    tooltips,
    settingsDefaultLabel,
    settingsToolLabel,
    toolLanguageOptionsHtml,
    langNames,
    shortcutLabel,
    shortcutResetLabel
}) {
    const translationBox = documentRef.createElement('div');
    translationBox.id = 'utstTranslationBox';
    translationBox.style.cssText = `
            all: initial;
            position: absolute;
            background: linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%);
            color: #ffffff;
            padding: 20px;
            padding-top: 40px;
            border-radius: 12px;
            z-index: 9999;
            display: none;
            min-width: 370px;
            max-width: 420px;
            min-height: 200px;
            max-height: 260px;
            overflow-y: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            box-sizing: border-box;
            line-height: 1.35;
            direction: ltr;
            text-align: left;
        `;
    root.appendChild(translationBox);

    translationBox.innerHTML = `
            <div id="dragHandle" style="position:absolute; top:0; left:0; right:0; height:28px; background: linear-gradient(120deg, #3a3a3f, #4b4b52); border-radius: 12px 12px 0 0; cursor: move; display:flex; align-items:center; gap:8px; padding:0 12px; color:#e5e5e5; font-size:12px; font-weight:600; letter-spacing:0.3px; box-shadow: inset 0 -1px 0 rgba(255,255,255,0.08); user-select: none;">
                <img class="utst-header-logo" data-utst-logo-src="${logoUrl}" alt="" draggable="false" aria-hidden="true">
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
            <div id="settingsHeader" style="position: absolute; top: 34px; left: 8px; display:none; align-items: center; gap: 8px; cursor: default;">
                <div id="backButton" style="width:20px; height:20px; min-width:20px; display:flex; align-items:center; justify-content:center; line-height:0; flex:0 0 20px; cursor:pointer;" title="Back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
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
        <div id="translationTextWrap" style="position:relative;">
            <div id="translationText"
                style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; min-height: 110px; height: 110px; max-height: 110px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; overflow-y: auto;">
            </div>
            <div id="utstPanelLoading" class="utst-modern-loader" data-mode="translate" aria-hidden="true" style="border-radius:8px;">
                <div class="utst-modern-loader__card">
                    <div class="utst-modern-loader__ring"></div>
                    <div class="utst-modern-loader__body">
                        <div id="utstPanelLoadingTitle" class="utst-modern-loader__title">${overlayLabels.translate}...</div>
                        <div class="utst-modern-loader__line"></div>
                    </div>
                </div>
            </div>
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
                        <div id="speakTranslated" class="utst-speak-option" style="padding: 6px 10px; cursor: pointer; border-radius:3px; transition: background 0.15s ease, color 0.15s ease;">${tooltips.listenTranslated}</div>
                        <div id="speakOriginal" class="utst-speak-option" style="padding: 6px 10px; cursor: pointer; border-radius:3px; transition: background 0.15s ease, color 0.15s ease;">${tooltips.listenOriginal}</div>
                    </div>
                </div>
                <div id="copyButton" style="cursor: pointer;" title="Copy translation">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                <div id="fullscreenToggle" style="cursor: pointer;" title="${overlayLabels.open}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
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


        <div id="settingsPanel" style="display:none; padding:31px 20px 20px; min-height:176px; max-height:200px; min-width:370px; max-width:370px; overflow-y:auto; box-sizing:border-box;">

        <label for="defaultTranslateLang" style="color:#fff; font-size:14px; display:block; margin-bottom:4px;">
        ${settingsDefaultLabel}
        </label>
        <select id="defaultTranslateLang" style="display:block; width:100%; max-width:260px; margin:0 auto; padding:5px 6px; border-radius:6px; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:13px; cursor: pointer;">
        ${targetLanguageOptionsHtml}
        </select>

        <label for="toolLanguage" style="color:#fff; font-size:14px; display:block; margin:12px 0 4px;">
        ${settingsToolLabel}
        </label>
        <select id="toolLanguage" style="display:block; width:100%; max-width:260px; margin:0 auto; padding:5px 6px; border-radius:6px; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:13px; cursor: pointer;">
        ${toolLanguageOptionsHtml}
        </select>

        <label for="panelTheme" style="color:#fff; font-size:14px; display:block; margin:12px 0 4px;">
        ${langNames.settingsThemeLabel}
        </label>
        <div id="panelThemePicker" style="position:relative; width:100%; max-width:260px; margin:0 auto;">
        <button id="panelThemeTrigger" type="button" style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; padding:6px 10px; border-radius:8px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; cursor:pointer; font-size:12px;">
            <span id="panelThemeCurrent">${langNames.themes.blue}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div id="panelThemePanel" style="display:none; position:absolute; top:calc(100% + 6px); right:0; left:0; width:100%; max-height:220px; border-radius:10px; padding:8px; z-index:2147483646;">
            <div id="panelThemeGrid" style="display:grid; grid-template-columns:1fr; gap:6px;"></div>
        </div>
        </div>
        <select id="panelTheme" style="display:none;">
        <option value="blue">${langNames.themes.blue}</option>
        <option value="dark">${langNames.themes.dark}</option>
        <option value="light">${langNames.themes.light}</option>
        </select>

        <label id="shortcutCaptureLabel" for="shortcutCaptureButton" style="color:#fff; font-size:14px; display:block; margin:12px 0 4px;">
        ${shortcutLabel}
        </label>
        <div class="utst-shortcut-control">
            <button id="shortcutCaptureButton" class="utst-shortcut-capture" type="button"></button>
            <button id="shortcutResetButton" class="utst-shortcut-reset" type="button" title="${shortcutResetLabel}">↺</button>
        </div>
        <div id="shortcutCaptureHelp" class="utst-shortcut-help"></div>

        <div class="utst-bubble-settings">
        <label class="utst-toggle-row" for="selectionBubbleEnabled">
            <input id="selectionBubbleEnabled" type="checkbox" />
            <span>${langNames.settingsBubbleLabel}</span>
        </label>

        <label for="bubbleBlacklistInput" style="color:#fff; font-size:13px; display:block; margin-bottom:4px;">
            ${langNames.settingsBlacklistLabel}
        </label>
        <div class="utst-blacklist-controls">
            <input id="bubbleBlacklistInput" class="utst-blacklist-input" type="text" placeholder="example.com" />
            <button id="bubbleBlacklistAdd" class="utst-blacklist-add" type="button">${langNames.settingsBlacklistAdd}</button>
        </div>
        <div id="bubbleBlacklistList" class="utst-blacklist-list utst-scroll"></div>
        </div>

        </div>



    `;
    translationBox.classList.add("utst-scroll");
    return translationBox;
}

export function createFullscreenOverlayView({
    documentRef,
    root,
    logoUrl,
    overlayLabels,
    langNames,
    sourceLanguageOptionsHtml,
    targetLanguageOptionsHtml,
    defaultTargetLabel
}) {
    const fullscreenOverlay = documentRef.createElement('div');
    fullscreenOverlay.id = 'fullscreenOverlay';
    fullscreenOverlay.style.cssText = `
        all: initial;
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(8px);
        z-index: 10001;
        padding: 18px;
        box-sizing: border-box;
    `;
    fullscreenOverlay.innerHTML = `
      <div id="fullscreenPanel" style="width: min(1100px, 95vw); min-height: 40vh; background: linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%); color: #fff; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 32px rgba(0,0,0,0.45); padding: 22px 22px 16px; position: relative;">
        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 14px;">
            <div id="fullscreenTitleWrap">
                <img class="utst-header-logo" data-utst-logo-src="${logoUrl}" alt="" draggable="false" aria-hidden="true">
                <div id="fullscreenTitle" style="font-size:16px; font-weight:700; letter-spacing:0.4px; color:#e7e9ff; cursor: default;">${overlayLabels.title}</div>
            </div>
            <div id="fullscreenClose" style="cursor:pointer; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition: background 0.15s ease;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
        </div>
        <div id="fullscreenColumns" style="display:flex; gap: 16px; min-height: 280px; flex-wrap: wrap;">
            <div style="flex:1; min-width:280px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <label id="fullscreenSourceLabel" style="color:#cfd3ff; font-size:13px; font-weight:600; letter-spacing:0.2px;">${overlayLabels.source}</label>
                    <div id="fullscreenSourcePicker" style="position:relative;">
                        <button id="fullscreenSourceLangTrigger" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; cursor:pointer; font-size:12px;">
                            <span id="fullscreenSourceLangCurrent">${langNames.auto}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="fullscreenSourceLangPanel" style="display:none; position:absolute; top:110%; right:0; width:280px; max-height:260px; background: rgba(30,30,47,0.98); border:1px solid rgba(255,255,255,0.12); box-shadow:0 10px 24px rgba(0,0,0,0.35); border-radius:10px; padding:8px; z-index:10002;">
                            <input id="fullscreenSourceLangSearch" placeholder="${langNames.navigator}" style="width:100%; max-width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.08); color:#fff; font-size:13px; outline:none;" />
                            <div id="fullscreenSourceLangGrid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:6px; max-height:190px; overflow-y:auto; padding-top:8px;"></div>
                        </div>
                    </div>
                </div>
                <select id="fullscreenSourceLang" style="display:none;">${sourceLanguageOptionsHtml}</select>
                <div id="fullscreenSourceWrap" style="position:relative; flex:1; min-height:200px;">
                    <textarea id="fullscreenSource" spellcheck="false" autocorrect="off" autocapitalize="off" style="width:100%; height:100%; min-height:200px; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.06); color:#fff; font-size:14px; line-height:1.5; resize: vertical; outline:none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);"></textarea>
                </div>
                <div style="display:flex; gap:8px; margin-top:6px;">
                    <div id="fullscreenSourceCopy" style="width:38px; height:38px; border-radius:9px; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; cursor:pointer; background: rgba(255,255,255,0.06);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </div>
                    <div id="fullscreenSourceSpeak" style="width:38px; height:38px; border-radius:9px; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; cursor:pointer; background: rgba(255,255,255,0.06);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div id="fullscreenSwap" title="Swap" style="align-self:center; width:40px; height:40px; border-radius:10px; background: transparent; border:none; box-shadow:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform 0.2s ease;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <line x1="3" y1="5" x2="21" y2="5"></line>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <line x1="21" y1="19" x2="3" y2="19"></line>
                </svg>
            </div>
            <div style="flex:1; min-width:280px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <label id="fullscreenTargetLabel" style="color:#cfd3ff; font-size:13px; font-weight:600; letter-spacing:0.2px;">${overlayLabels.target}</label>
                    <div id="fullscreenTargetPicker" style="position:relative;">
                        <button id="fullscreenTargetLangTrigger" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; cursor:pointer; font-size:12px;">
                            <span id="fullscreenTargetLangCurrent">${defaultTargetLabel}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="fullscreenTargetLangPanel" style="display:none; position:absolute; top:110%; right:0; width:280px; max-height:260px; background: rgba(30,30,47,0.98); border:1px solid rgba(255,255,255,0.12); box-shadow:0 10px 24px rgba(0,0,0,0.35); border-radius:10px; padding:8px; z-index:10002;">
                            <input id="fullscreenTargetLangSearch" placeholder="${langNames.navigator}" style="width:100%; max-width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.08); color:#fff; font-size:13px; outline:none;" />
                            <div id="fullscreenTargetLangGrid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:6px; max-height:190px; overflow-y:auto; padding-top:8px;"></div>
                        </div>
                    </div>
                </div>
                <select id="fullscreenTargetLang" style="display:none;">${targetLanguageOptionsHtml}</select>
                <div id="fullscreenTargetWrap" style="position:relative; flex:1; min-height:200px;">
                    <textarea id="fullscreenTarget" spellcheck="false" autocorrect="off" autocapitalize="off" style="width:100%; height:100%; min-height:200px; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.06); color:#fff; font-size:14px; line-height:1.5; resize: vertical; outline:none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);"></textarea>
                    <div id="utstFullscreenLoading" class="utst-modern-loader" data-mode="translate" aria-hidden="true" style="border-radius:10px;">
                        <div class="utst-modern-loader__card">
                            <div class="utst-modern-loader__ring"></div>
                            <div class="utst-modern-loader__body">
                                <div id="utstFullscreenLoadingTitle" class="utst-modern-loader__title">${overlayLabels.translate}...</div>
                                <div class="utst-modern-loader__line"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:6px;">
                    <div id="fullscreenTargetCopy" style="width:38px; height:38px; border-radius:9px; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; cursor:pointer; background: rgba(255,255,255,0.06);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </div>
                    <div id="fullscreenTargetSpeak" style="width:38px; height:38px; border-radius:9px; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; cursor:pointer; background: rgba(255,255,255,0.06);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
    fullscreenOverlay.classList.add("utst-scroll");
    root.appendChild(fullscreenOverlay);
    return fullscreenOverlay;
}

export function createSelectionBubbleView({ documentRef, root, bubbleLabels }) {
    const selectionBubble = documentRef.createElement('div');
    selectionBubble.id = 'utstSelectionBubble';
    selectionBubble.innerHTML = `
      <button id="utstSelectionBubbleClose" type="button" title="${bubbleLabels.closeTitle}" aria-label="${bubbleLabels.closeTitle}">×</button>
      <div id="utstSelectionBubbleDivider" aria-hidden="true"></div>
      <button id="utstSelectionBubbleAction" type="button" title="${bubbleLabels.translateTitle}" aria-label="${bubbleLabels.translateTitle}">
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8l6 6"></path>
          <path d="M4 14l6-6 2-3"></path>
          <path d="M2 5h12"></path>
          <path d="M7 2h1"></path>
          <path d="M22 22l-5-10-5 10"></path>
          <path d="M14 18h6"></path>
        </svg>
      </button>
      <div id="utstBubbleCloseMenu">
        <button id="utstBubbleHideSite" class="utst-bubble-menu-btn" type="button">${bubbleLabels.hideSite}</button>
        <button id="utstBubbleHideGlobal" class="utst-bubble-menu-btn" type="button">${bubbleLabels.hideGlobal}</button>
      </div>
    `;
    root.appendChild(selectionBubble);
    return selectionBubble;
}

export function createUiRefs({
    root,
    host,
    translationBox,
    fullscreenOverlay,
    selectionBubble
}) {
    function requireRef(scope, selector, path) {
        const element = scope && scope.querySelector(selector);
        if (!element) {
            throw new Error(`Missing required UI reference "${path}" for selector "${selector}"`);
        }
        return element;
    }

    const panel = {
        translationBox,
        sourceLangSelect: requireRef(translationBox, '#sourceLang', 'panel.sourceLangSelect'),
        targetLangSelect: requireRef(translationBox, '#targetLang', 'panel.targetLangSelect'),
        translationText: requireRef(translationBox, '#translationText', 'panel.translationText'),
        loadingOverlay: requireRef(translationBox, '#utstPanelLoading', 'panel.loadingOverlay'),
        loadingTitle: requireRef(translationBox, '#utstPanelLoadingTitle', 'panel.loadingTitle'),
        speakButton: requireRef(translationBox, '#speakButton', 'panel.speakButton'),
        speakTooltip: requireRef(translationBox, '#speakTooltip', 'panel.speakTooltip'),
        speakTranslated: requireRef(translationBox, '#speakTranslated', 'panel.speakTranslated'),
        speakOriginal: requireRef(translationBox, '#speakOriginal', 'panel.speakOriginal'),
        copyButton: requireRef(translationBox, '#copyButton', 'panel.copyButton'),
        settingsButton: requireRef(translationBox, '#settingsButton', 'panel.settingsButton'),
        backButton: requireRef(translationBox, '#backButton', 'panel.backButton'),
        closeButton: requireRef(translationBox, '#closeButton', 'panel.closeButton'),
        sourceAutoOption: null,
        translatorPanel: requireRef(translationBox, '#translatorPanel', 'panel.translatorPanel'),
        settingsPanel: requireRef(translationBox, '#settingsPanel', 'panel.settingsPanel'),
        settingsHeader: requireRef(translationBox, '#settingsHeader', 'panel.settingsHeader'),
        settingsHeaderTitle: requireRef(translationBox, '#settingsHeaderTitle', 'panel.settingsHeaderTitle'),
        fullscreenToggle: requireRef(translationBox, '#fullscreenToggle', 'panel.fullscreenToggle'),
        dragHandle: requireRef(translationBox, '#dragHandle', 'panel.dragHandle')
    };
    panel.sourceAutoOption = requireRef(panel.sourceLangSelect, 'option[value="auto"]', 'panel.sourceAutoOption');

    const settings = {
        defaultTargetSelect: requireRef(translationBox, '#defaultTranslateLang', 'settings.defaultTargetSelect'),
        toolLanguageSelect: requireRef(translationBox, '#toolLanguage', 'settings.toolLanguageSelect'),
        themeSelect: requireRef(translationBox, '#panelTheme', 'settings.themeSelect'),
        themeTrigger: requireRef(translationBox, '#panelThemeTrigger', 'settings.themeTrigger'),
        themeCurrent: requireRef(translationBox, '#panelThemeCurrent', 'settings.themeCurrent'),
        themePanel: requireRef(translationBox, '#panelThemePanel', 'settings.themePanel'),
        themeGrid: requireRef(translationBox, '#panelThemeGrid', 'settings.themeGrid'),
        selectionBubbleEnabledCheckbox: requireRef(translationBox, '#selectionBubbleEnabled', 'settings.selectionBubbleEnabledCheckbox'),
        bubbleBlacklistInput: requireRef(translationBox, '#bubbleBlacklistInput', 'settings.bubbleBlacklistInput'),
        bubbleBlacklistAddButton: requireRef(translationBox, '#bubbleBlacklistAdd', 'settings.bubbleBlacklistAddButton'),
        bubbleBlacklistList: requireRef(translationBox, '#bubbleBlacklistList', 'settings.bubbleBlacklistList'),
        defaultTargetLabel: requireRef(translationBox, 'label[for="defaultTranslateLang"]', 'settings.defaultTargetLabel'),
        toolLanguageLabel: requireRef(translationBox, 'label[for="toolLanguage"]', 'settings.toolLanguageLabel'),
        themeLabel: requireRef(translationBox, 'label[for="panelTheme"]', 'settings.themeLabel'),
        shortcutCaptureLabel: requireRef(translationBox, '#shortcutCaptureLabel', 'settings.shortcutCaptureLabel'),
        shortcutCaptureButton: requireRef(translationBox, '#shortcutCaptureButton', 'settings.shortcutCaptureButton'),
        shortcutResetButton: requireRef(translationBox, '#shortcutResetButton', 'settings.shortcutResetButton'),
        shortcutCaptureHelp: requireRef(translationBox, '#shortcutCaptureHelp', 'settings.shortcutCaptureHelp'),
        bubbleToggleLabel: requireRef(translationBox, 'label[for="selectionBubbleEnabled"] span', 'settings.bubbleToggleLabel'),
        bubbleBlacklistLabel: requireRef(translationBox, 'label[for="bubbleBlacklistInput"]', 'settings.bubbleBlacklistLabel')
    };

    const selection = {
        bubble: selectionBubble,
        closeButton: requireRef(selectionBubble, '#utstSelectionBubbleClose', 'selection.closeButton'),
        actionButton: requireRef(selectionBubble, '#utstSelectionBubbleAction', 'selection.actionButton'),
        closeMenu: requireRef(selectionBubble, '#utstBubbleCloseMenu', 'selection.closeMenu'),
        hideSiteButton: requireRef(selectionBubble, '#utstBubbleHideSite', 'selection.hideSiteButton'),
        hideGlobalButton: requireRef(selectionBubble, '#utstBubbleHideGlobal', 'selection.hideGlobalButton')
    };

    const fullscreen = {
        overlay: fullscreenOverlay,
        title: requireRef(fullscreenOverlay, '#fullscreenTitle', 'fullscreen.title'),
        closeButton: requireRef(fullscreenOverlay, '#fullscreenClose', 'fullscreen.closeButton'),
        sourceLangSelect: requireRef(fullscreenOverlay, '#fullscreenSourceLang', 'fullscreen.sourceLangSelect'),
        targetLangSelect: requireRef(fullscreenOverlay, '#fullscreenTargetLang', 'fullscreen.targetLangSelect'),
        sourceLangCurrent: requireRef(fullscreenOverlay, '#fullscreenSourceLangCurrent', 'fullscreen.sourceLangCurrent'),
        targetLangCurrent: requireRef(fullscreenOverlay, '#fullscreenTargetLangCurrent', 'fullscreen.targetLangCurrent'),
        sourceLangSearch: requireRef(fullscreenOverlay, '#fullscreenSourceLangSearch', 'fullscreen.sourceLangSearch'),
        targetLangSearch: requireRef(fullscreenOverlay, '#fullscreenTargetLangSearch', 'fullscreen.targetLangSearch'),
        sourceLangGrid: requireRef(fullscreenOverlay, '#fullscreenSourceLangGrid', 'fullscreen.sourceLangGrid'),
        targetLangGrid: requireRef(fullscreenOverlay, '#fullscreenTargetLangGrid', 'fullscreen.targetLangGrid'),
        sourceLangPanel: requireRef(fullscreenOverlay, '#fullscreenSourceLangPanel', 'fullscreen.sourceLangPanel'),
        targetLangPanel: requireRef(fullscreenOverlay, '#fullscreenTargetLangPanel', 'fullscreen.targetLangPanel'),
        sourceLangTrigger: requireRef(fullscreenOverlay, '#fullscreenSourceLangTrigger', 'fullscreen.sourceLangTrigger'),
        targetLangTrigger: requireRef(fullscreenOverlay, '#fullscreenTargetLangTrigger', 'fullscreen.targetLangTrigger'),
        panel: requireRef(fullscreenOverlay, '#fullscreenPanel', 'fullscreen.panel'),
        sourceLabel: requireRef(fullscreenOverlay, '#fullscreenSourceLabel', 'fullscreen.sourceLabel'),
        targetLabel: requireRef(fullscreenOverlay, '#fullscreenTargetLabel', 'fullscreen.targetLabel'),
        swapButton: requireRef(fullscreenOverlay, '#fullscreenSwap', 'fullscreen.swapButton'),
        sourceText: requireRef(fullscreenOverlay, '#fullscreenSource', 'fullscreen.sourceText'),
        targetText: requireRef(fullscreenOverlay, '#fullscreenTarget', 'fullscreen.targetText'),
        sourceWrap: requireRef(fullscreenOverlay, '#fullscreenSourceWrap', 'fullscreen.sourceWrap'),
        targetWrap: requireRef(fullscreenOverlay, '#fullscreenTargetWrap', 'fullscreen.targetWrap'),
        loadingOverlay: requireRef(fullscreenOverlay, '#utstFullscreenLoading', 'fullscreen.loadingOverlay'),
        loadingTitle: requireRef(fullscreenOverlay, '#utstFullscreenLoadingTitle', 'fullscreen.loadingTitle'),
        sourceCopyButton: requireRef(fullscreenOverlay, '#fullscreenSourceCopy', 'fullscreen.sourceCopyButton'),
        sourceSpeakButton: requireRef(fullscreenOverlay, '#fullscreenSourceSpeak', 'fullscreen.sourceSpeakButton'),
        targetCopyButton: requireRef(fullscreenOverlay, '#fullscreenTargetCopy', 'fullscreen.targetCopyButton'),
        targetSpeakButton: requireRef(fullscreenOverlay, '#fullscreenTargetSpeak', 'fullscreen.targetSpeakButton')
    };

    return {
        root: { host, root },
        views: { translationBox, fullscreenOverlay, selectionBubble },
        panel,
        settings,
        selection,
        fullscreen
    };
}
