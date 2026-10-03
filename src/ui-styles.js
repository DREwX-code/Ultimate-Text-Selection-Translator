export const UTST_STYLE_TEXT = `
            :host {
                all: initial !important;
                position: static !important;
                display: contents !important;
                color-scheme: normal !important;
                font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            }

            :host *,
            :host *::before,
            :host *::after {
                box-sizing: border-box !important;
            }

            #closeButton:hover svg {
                stroke: #ff4d4d !important;
                filter: none;
                transform: none;
                transition: stroke 0.15s ease;
            }

            .utst-header-logo {
                width: 16px !important;
                height: 16px !important;
                min-width: 16px !important;
                display: block !important;
                object-fit: contain !important;
                pointer-events: none !important;
                user-select: none !important;
                flex: 0 0 18px !important;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.28)) !important;
            }

            #fullscreenTitleWrap {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                min-width: 0 !important;
            }

            .utst-scroll {
                scrollbar-width: thin !important;
                scrollbar-color: rgba(100, 149, 237, 0.5) rgba(0, 0, 0, 0.1) !important;
            }

            .utst-scroll::-webkit-scrollbar {
                width: 6px !important;
                height: 6px !important;
            }

            .utst-scroll::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05) !important;
                border-radius: 3px !important;
            }

            .utst-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15) !important;
                border-radius: 3px !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
            }

            .utst-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3) !important;
            }

            #utstSelectionBubble {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                gap: 0;
                height: 40px;
                padding: 0 6px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(25, 25, 35, 0.85);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: #fff;
                opacity: 0;
                transform: translateY(-8px) scale(0.95);
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Roboto', sans-serif;
                box-sizing: border-box !important;
            }

            #utstTranslationBox,
            #utstTranslationBox * {
                box-sizing: border-box !important;
            }

            #utstTranslationBox,
            #fullscreenOverlay,
            #utstSelectionBubble,
            .utst-inline-lang-panel {
                font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                font-size: 14px !important;
                line-height: 1.35 !important;
                letter-spacing: normal !important;
                text-transform: none !important;
                text-size-adjust: 100% !important;
                -webkit-text-size-adjust: 100% !important;
                direction: ltr !important;
                writing-mode: horizontal-tb !important;
                zoom: 1 !important;
                isolation: isolate !important;
            }

            #fullscreenOverlay,
            #fullscreenOverlay *,
            #utstSelectionBubble,
            #utstSelectionBubble *,
            .utst-inline-lang-panel,
            .utst-inline-lang-panel * {
                box-sizing: border-box !important;
                text-transform: none !important;
                letter-spacing: normal !important;
            }

            #fullscreenOverlay {
                overflow: auto !important;
            }

            #fullscreenOverlay.utst-side-panel {
                align-items: stretch !important;
                justify-content: flex-end !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: transparent !important;
                backdrop-filter: none !important;
                pointer-events: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenPanel {
                width: var(--utst-side-panel-width) !important;
                max-width: var(--utst-side-panel-width) !important;
                height: 100% !important;
                min-height: 0 !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 18px !important;
                border-radius: 0 !important;
                border-top: 0 !important;
                border-right: 0 !important;
                border-bottom: 0 !important;
                overflow: auto !important;
                pointer-events: auto !important;
                contain: layout paint !important;
                will-change: width !important;
                animation: none !important;
            }

            #fullscreenOverlay.utst-side-panel.utst-side-panel-entering #fullscreenPanel {
                animation: utst-side-panel-in .18s ease-out !important;
            }

            #fullscreenResizeHandle {
                display: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenResizeHandle {
                display: block !important;
                position: absolute !important;
                z-index: 2 !important;
                top: 0 !important;
                right: calc(var(--utst-side-panel-width) - 5px) !important;
                width: 10px !important;
                height: 100% !important;
                cursor: ew-resize !important;
                pointer-events: auto !important;
                touch-action: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenResizeHandle::after {
                content: '' !important;
                position: absolute !important;
                top: 50% !important;
                left: 4px !important;
                width: 2px !important;
                height: 42px !important;
                border-radius: 99px !important;
                background: rgba(126, 169, 255, 0.52) !important;
                opacity: 0 !important;
                transform: translateY(-50%) !important;
                transition: opacity .16s ease !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenResizeHandle:hover::after,
            #fullscreenOverlay.utst-side-resizing #fullscreenResizeHandle::after {
                opacity: 1 !important;
            }

            #fullscreenOverlay.utst-side-resizing #fullscreenPanel {
                transition: none !important;
                user-select: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSettings {
                display: flex !important;
                width: 36px !important;
                height: 36px !important;
                opacity: .8 !important;
                transition: color .16s ease, opacity .16s ease, background .16s ease !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSettings svg {
                width: 21px !important;
                height: 21px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenClose {
                width: 36px !important;
                height: 36px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenClose svg {
                width: 22px !important;
                height: 22px !important;
            }

            #fullscreenOverlay:not(.utst-side-panel) #fullscreenSettings {
                display: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSettings:hover,
            #fullscreenOverlay.utst-side-panel #fullscreenSettings[aria-pressed="true"] {
                color: #79b3ff !important;
                background: rgba(121, 179, 255, .12) !important;
                opacity: 1 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenPanel {
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
                padding: 16px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenTitleWrap {
                gap: 10px !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-header-logo {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                flex-basis: 20px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenTitle {
                font-size: 18px !important;
                font-weight: 780 !important;
                letter-spacing: .7px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenHeader {
                flex: 0 0 auto !important;
                min-height: 34px !important;
                margin-bottom: 12px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenColumns {
                display: flex !important;
                flex: 1 1 auto !important;
                min-height: 0 !important;
                flex-direction: column !important;
                flex-wrap: nowrap !important;
                position: relative !important;
                gap: 14px !important;
                overflow: auto !important;
                overscroll-behavior: contain !important;
                padding: 58px 2px 12px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenColumns > .utst-fullscreen-column {
                flex: 0 0 auto !important;
                min-width: 0 !important;
                gap: 6px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenColumns > .utst-fullscreen-column:first-child {
                order: 1 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenColumns > .utst-fullscreen-column:last-child {
                order: 2 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSwap {
                position: absolute !important;
                z-index: 3 !important;
                top: 4px !important;
                left: 50% !important;
                order: initial !important;
                align-self: auto !important;
                width: 42px !important;
                height: 42px !important;
                margin: 0 !important;
                opacity: .84 !important;
                transform: translateX(-50%) rotate(var(--utst-swap-rot, 0deg)) !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourceLabel,
            #fullscreenOverlay.utst-side-panel #fullscreenTargetLabel {
                display: none !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourcePicker,
            #fullscreenOverlay.utst-side-panel #fullscreenTargetPicker {
                position: absolute !important;
                z-index: 2 !important;
                top: 0 !important;
                width: calc(50% - 30px) !important;
                margin: 0 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourcePicker {
                left: 0 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenTargetPicker {
                right: 0 !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourcePicker > button,
            #fullscreenOverlay.utst-side-panel #fullscreenTargetPicker > button {
                width: 100% !important;
                min-height: 42px !important;
                justify-content: space-between !important;
                padding: 8px 12px !important;
                border-radius: 10px !important;
                font-size: 13px !important;
                font-weight: 620 !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-fullscreen-column > div:first-child {
                height: 0 !important;
                min-height: 0 !important;
                overflow: visible !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourceWrap,
            #fullscreenOverlay.utst-side-panel #fullscreenTargetWrap {
                flex: 0 0 auto !important;
                height: clamp(132px, 24vh, 238px) !important;
                min-height: 132px !important;
                max-height: 238px !important;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSource,
            #fullscreenOverlay.utst-side-panel #fullscreenTarget {
                height: 100% !important;
                min-height: 0 !important;
                max-height: none !important;
                resize: none !important;
                border-color: rgba(255, 255, 255, .12) !important;
                background: rgba(255, 255, 255, .045) !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-fullscreen-actions {
                justify-content: flex-end !important;
                gap: 4px !important;
                margin-top: 1px !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-fullscreen-actions > :is(div, button) {
                width: 34px !important;
                height: 34px !important;
                border: 0 !important;
                background: transparent !important;
                opacity: .78 !important;
                transition: opacity .16s ease, background .16s ease !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-fullscreen-actions > :is(div, button):hover {
                opacity: 1 !important;
                background: rgba(255, 255, 255, .08) !important;
            }

            .utst-dictate-button {
                appearance: none;
                padding: 0;
                color: inherit;
                position: relative;
            }

            #fullscreenOverlay.utst-side-panel #fullscreenSourceDictate {
                min-width: 34px !important;
                min-height: 34px !important;
            }

            .utst-dictate-button svg,
            .utst-dictate-button svg * {
                stroke: currentColor !important;
            }

            .utst-dictate-button.utst-dictating {
                color: #65a9ff !important;
                border-color: color-mix(in srgb, #65a9ff 52%, transparent) !important;
                background: color-mix(in srgb, #65a9ff 12%, transparent) !important;
                opacity: 1 !important;
            }

            .utst-dictate-button.utst-dictating svg {
                opacity: 0;
            }

            .utst-dictate-button.utst-dictating::after {
                content: '';
                position: absolute;
                width: 9px;
                height: 9px;
                border-radius: 2px;
                background: currentColor;
                box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 32%, transparent);
            }

            .utst-dictate-button:disabled {
                cursor: not-allowed !important;
                opacity: .42 !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-copy-check {
                width: 15px !important;
                height: 15px !important;
                stroke: #57c98a !important;
                stroke-width: 2.4 !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-copy-success,
            #fullscreenOverlay.utst-side-panel .utst-copy-success svg,
            #fullscreenOverlay.utst-side-panel .utst-copy-success svg * {
                color: #57c98a !important;
                stroke: #57c98a !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #fullscreenColumns {
                display: none !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel {
                position: static !important;
                display: block !important;
                width: 100% !important;
                min-width: 0 !important;
                max-width: none !important;
                min-height: 0 !important;
                max-height: none !important;
                flex: 1 1 auto !important;
                margin: 0 !important;
                padding: 8px 2px 18px !important;
                overflow: auto !important;
                overscroll-behavior: contain !important;
                background: transparent !important;
                border-radius: 0 !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel .utst-language-picker {
                max-width: none !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel > label,
            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel .utst-bubble-settings > label {
                text-align: left !important;
                margin-left: 0 !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel :is(#defaultTranslateLang, #toolLanguage, #panelThemePicker, .utst-shortcut-control, .utst-shortcut-help) {
                width: min(280px, 100%) !important;
                max-width: 280px !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel :is(#defaultTranslateLang, #toolLanguage, #panelThemeTrigger) {
                min-height: 42px !important;
                border-radius: 10px !important;
                padding: 8px 12px !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel #panelThemePicker {
                position: relative !important;
                width: min(280px, 100%) !important;
                max-width: 280px !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel .utst-bubble-settings {
                margin-top: 18px !important;
                padding-top: 16px !important;
            }

            .utst-settings-section-title {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                margin: 18px 0 8px !important;
                color: rgba(232, 240, 255, .92) !important;
                font-size: 17px !important;
                font-weight: 780 !important;
                letter-spacing: .01em !important;
                text-transform: none !important;
            }

            .utst-settings-section-title::after {
                content: '' !important;
                flex: 1 1 auto !important;
                height: 1px !important;
                background: rgba(255, 255, 255, .14) !important;
            }

            #settingsPanel > .utst-settings-section-title:first-child {
                margin-top: 2px !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel .utst-settings-section-title {
                margin-top: 24px !important;
                margin-bottom: 10px !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel > .utst-settings-section-title:first-child {
                margin-top: 4px !important;
            }

            #fullscreenOverlay.utst-side-panel :is(#fullscreenSourceLangPanel, #fullscreenTargetLangPanel) {
                pointer-events: auto !important;
                z-index: 2147483646 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel {
                background: transparent !important;
                backdrop-filter: none !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #fullscreenPanel {
                background: linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%) !important;
                border-color: rgba(30, 41, 59, .10) !important;
                color: #203150 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel :is(#fullscreenSource, #fullscreenTarget, #fullscreenSourceLangTrigger, #fullscreenTargetLangTrigger) {
                background: #ffffff !important;
                border-color: #cbd5e1 !important;
                color: #203150 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel :is(select, input, .utst-shortcut-capture, .utst-shortcut-reset, #panelThemeTrigger, #bubbleBlacklistList) {
                background: #ffffff !important;
                border-color: #cbd5e1 !important;
                color: #203150 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-settings-section-title {
                color: #64748b !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-settings-section-title::after {
                background: #dbe3ee !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-bubble-settings {
                border-top-color: #dbe3ee !important;
            }

            html.utst-theme-light #panelThemePanel {
                background: #ffffff !important;
                border-color: #cbd5e1 !important;
                color: #203150 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #fullscreenPanel .utst-fullscreen-actions > :is(div, button) {
                border: 1px solid #cbd5e1 !important;
                background: #ffffff !important;
                box-shadow: 0 1px 2px rgba(15, 23, 42, .06) !important;
                opacity: .9 !important;
                transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #fullscreenPanel .utst-fullscreen-actions > :is(div, button):hover {
                background: #eff6ff !important;
                border-color: #60a5fa !important;
                box-shadow: 0 5px 14px rgba(37, 99, 235, .16) !important;
                transform: translateY(-1px) !important;
                opacity: 1 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel :is(#defaultTranslateLang, #toolLanguage),
            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel :is(#defaultTranslateLang, #toolLanguage) option {
                background: #ffffff !important;
                color: #203150 !important;
                -webkit-text-fill-color: #203150 !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-language-trigger {
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-toggle-row input[type="checkbox"] {
                background: #d9e1ec !important;
                border-color: #b8c4d6 !important;
                box-shadow: none !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-toggle-row input[type="checkbox"]::after {
                background: #ffffff !important;
            }

            html.utst-theme-light #fullscreenOverlay.utst-side-panel #settingsPanel .utst-toggle-row input[type="checkbox"]:checked {
                background: #2563eb !important;
                border-color: #2563eb !important;
                box-shadow: 0 0 0 2px rgba(37, 99, 235, .18) !important;
                opacity: 1 !important;
            }

            @keyframes utst-side-panel-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            #fullscreenPanel {
                width: min(1100px, 95vw) !important;
                max-width: 95vw !important;
                overflow: auto !important;
                box-sizing: border-box !important;
            }

            #fullscreenColumns {
                min-width: 0 !important;
            }

            #fullscreenColumns > div {
                min-width: 0 !important;
            }

            #fullscreenSource,
            #fullscreenTarget,
            #fullscreenSourceWrap,
            #fullscreenTargetWrap {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
            }

            #fullscreenSource,
            #fullscreenTarget {
                min-height: min(200px, 30dvh) !important;
                max-height: min(62vh, 560px) !important;
                resize: vertical !important;
                box-sizing: border-box !important;
            }

            #fullscreenSourceWrap,
            #fullscreenTargetWrap {
                box-sizing: border-box !important;
            }

            #backButton {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                line-height: 0 !important;
                flex: 0 0 20px !important;
            }

            #backButton svg {
                width: 20px !important;
                height: 20px !important;
                display: block !important;
                flex: 0 0 20px !important;
            }

            #utstTranslationBox {
                width: min(420px, calc(var(--utst-vw, 100vw) - 20px)) !important;
                min-width: 0 !important;
                max-width: min(420px, calc(var(--utst-vw, 100vw) - 20px)) !important;
            }

            #utstTranslationBox select,
            #utstTranslationBox option {
                -webkit-appearance: menulist !important;
                -moz-appearance: menulist !important;
                appearance: auto !important;
                background-image: none !important;
                font-family: inherit !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
                color: #fff !important;
            }

            #utstTranslationBox select {
                padding-right: 24px !important;
                min-height: 30px !important;
            }

            #utstSelectionBubble.utst-visible {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            #utstSelectionBubbleClose {
                width: 30px;
                height: 30px;
                border: 0;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.7);
                background: transparent;
                font-size: 16px;
                font-weight: 500;
                line-height: 1;
                transition: all 0.2s ease;
                cursor: pointer;
                user-select: none;
                margin-right: 2px;
            }

            #utstSelectionBubbleClose:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                transform: rotate(90deg);
            }

            #utstSelectionBubbleDivider {
                width: 1px;
                height: 20px;
                margin: 0 6px;
                background: rgba(255, 255, 255, 0.2);
            }

            #utstSelectionBubbleAction {
                width: 30px;
                height: 30px;
                border: 0;
                border-radius: 50%;
                padding: 0;
                background: transparent;
                color: #fff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            #utstSelectionBubbleAction svg {
                width: 18px;
                height: 18px;
                color: #d8e8ff;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }

            #utstSelectionBubbleAction:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: scale(1.1);
            }

            #panelSpeakControl { position: relative; display: grid; place-items: center; }
            #speakTooltip { display: none !important; }
            #panelSpeakControl.utst-speak-menu-open #speakTooltip { display: flex !important; }
            @media (hover: hover) and (pointer: fine) {
                #panelSpeakControl:hover #speakTooltip { display: flex !important; }
            }
            #speakTooltip { flex-direction: column; align-items: stretch; gap: 0; min-width: 196px; }
            #speakTooltip .utst-speak-option {
                display: flex; width: 100%; min-height: 32px; border: 0; border-radius: 6px; padding: 7px 10px;
                align-items: center; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;
                transition: background .15s ease;
            }
            #speakTooltip .utst-speak-option + .utst-speak-option { border-top: 1px solid rgba(255,255,255,.14); }
            #speakTooltip .utst-speak-option:hover { background: rgba(255,255,255,.12); }

            #panelThemeCurrent,
            .utst-theme-option-label {
                display: inline-flex !important;
                align-items: center !important;
                gap: 9px !important;
                min-width: 0 !important;
            }

            #panelThemeCurrent span:last-child,
            .utst-theme-option-label span:last-child {
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }

            .utst-theme-swatch {
                width: 16px !important;
                height: 10px !important;
                min-width: 16px !important;
                border-radius: 4px !important;
                border: 1px solid var(--utst-theme-swatch-border, rgba(255, 255, 255, 0.24)) !important;
                background: var(--utst-theme-swatch-bg, #2563eb) !important;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
            }

            #fullscreenSwap {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }

            #fullscreenSwap:hover,
            #fullscreenSwap:active {
                background: transparent !important;
                box-shadow: none !important;
            }

            #utstBubbleCloseMenu {
                position: absolute;
                left: 0;
                top: calc(100% + 10px);
                display: none;
                flex-direction: column;
                min-width: 180px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(30, 30, 40, 0.95);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                overflow: hidden;
                animation: utstFadeIn 0.2s ease;
            }

            @keyframes utstFadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }

            #utstBubbleCloseMenu.utst-open {
                display: flex;
            }

            .utst-bubble-menu-btn {
                border: 0;
                background: transparent;
                color: rgba(255, 255, 255, 0.9);
                text-align: left;
                font-size: 13px;
                padding: 10px 14px;
                cursor: pointer;
                transition: background 0.15s ease;
                font-family: inherit;
            }

            .utst-bubble-menu-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .utst-bubble-settings {
                margin-top: 14px;
                padding-top: 14px;
            }

            #utstTranslationBox #settingsHeader {
                padding: 4px 8px;
                border-radius: 10px;
                background: #222b3f;
                border: 1px solid rgba(255, 255, 255, 0.08);
                right: 8px;
                z-index: 14;
            }

            #utstTranslationBox #settingsPanel {
                position: absolute;
                top: 62px;
                left: 8px;
                right: 8px;
                bottom: 10px;
                z-index: 13;
                margin: 0;
                min-width: 0 !important;
                max-width: none !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow-y: auto;
                border-radius: 10px;
                background: transparent;
            }

            #utstTranslationBox #translatorPanel {
                transition: filter 0.18s ease, opacity 0.18s ease;
            }

            #utstTranslationBox #translationTextWrap,
            #fullscreenPanel #fullscreenTargetWrap {
                position: relative;
            }

            .utst-modern-loader {
                position: absolute;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                background: linear-gradient(135deg, rgba(12, 20, 36, 0.7) 0%, rgba(16, 28, 50, 0.62) 100%);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                opacity: 0;
                pointer-events: none;
                transform: scale(0.985);
                transition: opacity 0.2s ease, transform 0.2s ease;
                z-index: 9;
            }

            .utst-modern-loader.is-active {
                display: flex;
                opacity: 1;
                pointer-events: auto;
                transform: scale(1);
            }

            .utst-modern-loader__card {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 170px;
                max-width: calc(100% - 20px);
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.18);
                background: rgba(8, 14, 28, 0.64);
                box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
            }

            .utst-modern-loader__ring {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-top-color: #7bb1ff;
                animation: utstLoaderSpin 0.8s linear infinite;
                flex: none;
            }

            .utst-modern-loader[data-mode="language"] .utst-modern-loader__ring {
                border-top-color: #4fd0a9;
            }

            .utst-modern-loader__body {
                display: flex;
                flex-direction: column;
                gap: 6px;
                min-width: 105px;
            }

            .utst-modern-loader__title {
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.2px;
                color: rgba(245, 248, 255, 0.95);
                line-height: 1.2;
                white-space: nowrap;
            }

            .utst-modern-loader__line {
                width: 100%;
                height: 6px;
                border-radius: 999px;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.4) 48%, rgba(255, 255, 255, 0.14) 100%);
                background-size: 180% 100%;
                animation: utstLoaderShimmer 1.1s linear infinite;
            }

            html.utst-theme-dark .utst-modern-loader {
                background: linear-gradient(135deg, rgba(10, 10, 10, 0.78) 0%, rgba(20, 20, 20, 0.78) 100%) !important;
            }

            html.utst-theme-dark .utst-modern-loader__card {
                background: rgba(16, 16, 16, 0.74) !important;
                border-color: rgba(255, 255, 255, 0.14) !important;
                box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45) !important;
            }

            html.utst-theme-dark .utst-modern-loader__ring {
                border-color: rgba(255, 255, 255, 0.16) !important;
                border-top-color: #d0d0d0 !important;
            }

            html.utst-theme-dark .utst-modern-loader[data-mode="language"] .utst-modern-loader__ring {
                border-top-color: #55c89a !important;
            }

            html.utst-theme-dark .utst-modern-loader__title {
                color: rgba(245, 245, 245, 0.94) !important;
            }

            html.utst-theme-dark .utst-modern-loader__line {
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.32) 50%, rgba(255, 255, 255, 0.1) 100%) !important;
            }

            @keyframes utstLoaderSpin {
                to { transform: rotate(360deg); }
            }

            @keyframes utstLoaderShimmer {
                from { background-position: 180% 0; }
                to { background-position: -80% 0; }
            }

            #utstTranslationBox.utst-settings-open #translatorPanel {
                filter: blur(4px) saturate(0.9);
                opacity: 0.34;
                pointer-events: none;
                user-select: none;
            }

            .utst-toggle-row {
                display: flex;
                align-items: center;
                gap: 10px;
                color: rgba(255, 255, 255, 0.9);
                font-size: 13px;
                margin-bottom: 10px;
                user-select: none;
                cursor: pointer;
            }

            .utst-toggle-row input[type="checkbox"] {
                appearance: none;
                width: 36px;
                height: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                position: relative;
                cursor: pointer;
                transition: background 0.2s;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .utst-toggle-row input[type="checkbox"]::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 14px;
                height: 14px;
                background: #fff;
                border-radius: 50%;
                transition: transform 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }

            .utst-toggle-row input[type="checkbox"]:checked {
                background: #4a90e2;
                border-color: #4a90e2;
            }

            .utst-toggle-row input[type="checkbox"]:checked::after {
                transform: translateX(16px);
            }

            .utst-blacklist-controls {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }

            .utst-blacklist-input {
                flex: 1;
                min-width: 0;
                box-sizing: border-box;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(0, 0, 0, 0.2);
                color: #fff;
                font-size: 12px;
                font-family: inherit;
                transition: border-color 0.2s;
            }

            .utst-blacklist-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.15);
                box-shadow: none;
            }

            .utst-blacklist-input:focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }

            #utstTranslationBox select:focus,
            #utstTranslationBox select:focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }

            .utst-language-trigger:focus,
            .utst-language-trigger:focus-visible,
            #panelThemeTrigger:focus,
            #panelThemeTrigger:focus-visible,
            .inlineLangSearch:focus,
            .inlineLangSearch:focus-visible,
            #fullscreenSourceLangSearch:focus,
            #fullscreenSourceLangSearch:focus-visible,
            #fullscreenTargetLangSearch:focus,
            #fullscreenTargetLangSearch:focus-visible {
                outline: none !important;
                outline-offset: 0 !important;
                box-shadow: none !important;
            }

            .utst-blacklist-add {
                border: none;
                border-radius: 8px;
                background: #4a90e2;
                color: #fff;
                font-size: 12px;
                font-weight: 600;
                padding: 0 12px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .utst-blacklist-add:hover {
                background: #357abd;
            }

            .utst-blacklist-list {
                margin-top: 10px;
                max-height: 120px;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.15);
            }

            .utst-blacklist-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.9);
                padding: 6px 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.03);
                transition: background 0.1s;
            }

            .utst-blacklist-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .utst-blacklist-item + .utst-blacklist-item {
                margin-top: 4px;
            }

            .utst-blacklist-remove {
                border: none;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                width: 20px;
                height: 20px;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .utst-blacklist-remove:hover {
                background: rgba(255, 77, 77, 0.2);
                color: #ff4d4d;
            }

            .utst-blacklist-empty {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                padding: 4px;
                text-align: center;
            }

            .utst-shortcut-control {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                max-width: 260px;
                margin: 0 auto;
            }

            .utst-shortcut-capture {
                flex: 1;
                min-width: 0;
                height: 32px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.18);
                background: rgba(255, 255, 255, 0.08);
                color: #fff;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
            }

            .utst-shortcut-capture.is-recording {
                border-color: #4a90e2;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.22);
            }

            .utst-shortcut-reset {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.16);
                background: rgba(255, 255, 255, 0.06);
                color: #fff;
                font-size: 15px;
                line-height: 1;
                cursor: pointer;
                font-family: inherit;
            }

            .utst-shortcut-help {
                width: 100%;
                max-width: 260px;
                margin: 5px auto 0;
                min-height: 14px;
                color: rgba(255, 255, 255, 0.58);
                font-size: 11px;
                line-height: 1.25;
            }

            html.utst-theme-blue #utstSelectionBubble {
                background: linear-gradient(135deg, rgba(30, 30, 47, 0.96) 0%, rgba(35, 35, 52, 0.96) 100%);
                border-color: rgba(255, 255, 255, 0.15);
                box-shadow: 0 8px 25px rgba(10, 14, 28, 0.5);
            }

            html.utst-theme-blue #utstSelectionBubbleDivider {
                background: rgba(255, 255, 255, 0.2);
            }

            html.utst-theme-blue #utstSelectionBubbleAction svg,
            html.utst-theme-blue #utstSelectionBubbleClose {
                color: #eaf2ff;
            }

            html.utst-theme-blue #utstTranslationBox {
                background: linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%) !important;
                border-color: rgba(255, 255, 255, 0.10) !important;
                color: #ffffff !important;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45) !important;
            }

            html.utst-theme-blue #utstTranslationBox #dragHandle {
                background: linear-gradient(120deg, #1b1b2d, #262645) !important;
                color: #ffffff !important;
                box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.10) !important;
            }

            html.utst-theme-blue #utstTranslationBox #translationText {
                background: rgba(255, 255, 255, 0.06) !important;
                border: 1px solid rgba(255, 255, 255, 0.16) !important;
                color: #ffffff !important;
            }

            html.utst-theme-blue #utstTranslationBox select,
            html.utst-theme-blue #utstTranslationBox input,
            html.utst-theme-blue #utstTranslationBox .utst-shortcut-capture,
            html.utst-theme-blue #utstTranslationBox .utst-shortcut-reset {
                background: rgba(255, 255, 255, 0.08) !important;
                border-color: rgba(255, 255, 255, 0.14) !important;
                color: #ffffff !important;
            }

            html.utst-theme-blue #utstTranslationBox .utst-bubble-settings {
                border-top-color: rgba(255, 255, 255, 0.14) !important;
            }

            html.utst-theme-blue #utstTranslationBox .utst-toggle-row input[type="checkbox"] {
                background: rgba(255, 255, 255, 0.10) !important;
                border-color: rgba(255, 255, 255, 0.16) !important;
            }

            html.utst-theme-blue #utstTranslationBox .utst-toggle-row input[type="checkbox"]:checked {
                background: #4a90e2 !important;
                border-color: #8bb1ff !important;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.18) !important;
            }

            html.utst-theme-dark #utstSelectionBubble {
                background: linear-gradient(135deg, rgba(18, 18, 18, 0.96) 0%, rgba(28, 28, 28, 0.96) 100%) !important;
                border-color: rgba(255, 255, 255, 0.08) !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6) !important;
            }

            html.utst-theme-dark #utstSelectionBubbleDivider {
                background: rgba(255, 255, 255, 0.15) !important;
            }

            html.utst-theme-dark #utstSelectionBubbleAction svg,
            html.utst-theme-dark #utstSelectionBubbleClose {
                color: #d0d0d0 !important;
            }

            html.utst-theme-dark #utstTranslationBox {
                background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%) !important;
                border-color: rgba(255,255,255,0.08) !important;
            }

            html.utst-theme-dark #utstTranslationBox #dragHandle {
                background: linear-gradient(120deg, #1a1a1a, #252525) !important;
            }

            html.utst-theme-dark #fullscreenPanel {
                background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%) !important;
                border-color: rgba(255,255,255,0.08) !important;
            }

            html.utst-theme-blue #utstTranslationBox #settingsHeader {
                background: rgba(30, 30, 47, 0.78) !important;
                border-color: rgba(255, 255, 255, 0.14) !important;
            }

            html.utst-theme-blue #utstTranslationBox #settingsPanel {
                background: transparent !important;
            }

            html.utst-theme-dark #utstTranslationBox #settingsHeader {
                background: #1a1a1a !important;
                border-color: rgba(255, 255, 255, 0.14) !important;
            }

            html.utst-theme-dark #utstTranslationBox #settingsPanel {
                background: transparent !important;
            }

            html.utst-theme-light #utstSelectionBubble {
                background: linear-gradient(135deg, #f0f2f5 0%, #e1e4e8 100%) !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            }

            html.utst-theme-light #utstSelectionBubbleDivider {
                background: rgba(0, 0, 0, 0.1) !important;
            }

            html.utst-theme-light #utstSelectionBubbleAction svg,
            html.utst-theme-light #utstSelectionBubbleClose {
                color: #4a5568 !important;
            }

            html.utst-theme-light #utstBubbleCloseMenu {
                background: rgba(255, 255, 255, 0.98) !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            }


            html.utst-theme-light .utst-bubble-menu-btn {
                color: #2d3748 !important;
            }

            html.utst-theme-light .utst-bubble-menu-btn:hover {
                background: rgba(0, 0, 0, 0.05) !important;
            }

            html.utst-theme-light #utstTranslationBox {
                background: linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%) !important;
                border-color: rgba(0, 0, 0, 0.08) !important;
                color: #1a202c !important;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
            }

            html.utst-theme-light #utstTranslationBox #dragHandle {
                background: linear-gradient(120deg, #edf2f7, #e2e8f0) !important;
                color: #4a5568 !important;
                box-shadow: inset 0 -1px 0 rgba(0,0,0,0.05) !important;
            }

            html.utst-theme-light #utstTranslationBox #dragHandle > div {
                background: rgba(74, 85, 104, 0.45) !important;
            }

            html.utst-theme-light #utstTranslationBox svg {
                stroke: #4a5568;
            }
            html.utst-theme-light #utstTranslationBox #closeButton svg {
                stroke: #ef4444 !important;
            }

            html.utst-theme-light #utstTranslationBox #settingsButton svg path {
                stroke: #4a5568 !important;
            }

            html.utst-theme-light #utstTranslationBox #translatorPanel *,
            html.utst-theme-light #utstTranslationBox #settingsPanel *,
            html.utst-theme-light #utstTranslationBox #settingsHeader *,
            html.utst-theme-light #fullscreenPanel * {
                color: #2d3748 !important;
            }

            html.utst-theme-light #utstTranslationBox #translationText {
                background: #f7fafc !important;
                border: 1px solid #e2e8f0 !important;
                color: #1a202c !important;
            }

            html.utst-theme-light .utst-modern-loader {
                background: linear-gradient(135deg, rgba(241, 245, 249, 0.78) 0%, rgba(226, 232, 240, 0.78) 100%) !important;
            }

            html.utst-theme-light .utst-modern-loader__card {
                background: rgba(255, 255, 255, 0.9) !important;
                border-color: rgba(148, 163, 184, 0.45) !important;
                box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12) !important;
            }

            html.utst-theme-light .utst-modern-loader__ring {
                border-color: rgba(71, 85, 105, 0.2) !important;
                border-top-color: #2563eb !important;
            }

            html.utst-theme-light .utst-modern-loader[data-mode="language"] .utst-modern-loader__ring {
                border-top-color: #0f9f6e !important;
            }

            html.utst-theme-light .utst-modern-loader__title {
                color: #1e293b !important;
            }

            html.utst-theme-light .utst-modern-loader__line {
                background: linear-gradient(90deg, rgba(30, 41, 59, 0.08) 0%, rgba(37, 99, 235, 0.28) 50%, rgba(30, 41, 59, 0.08) 100%) !important;
            }

            html.utst-theme-light #utstTranslationBox select,
            html.utst-theme-light #utstTranslationBox input {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
                color: #2d3748 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-toggle-row input[type="checkbox"] {
                background: #d9e1ec !important;
                border: 1px solid #b8c4d6 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-toggle-row input[type="checkbox"]::after {
                background: #ffffff !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-toggle-row input[type="checkbox"]:checked {
                background: #4a90e2 !important;
                border-color: #4a90e2 !important;
            }

            html.utst-theme-light #utstTranslationBox #bubbleBlacklistList {
                background: #ffffff !important;
                border-color: #e2e8f0 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-blacklist-item {
                background: #f7fafc !important;
                color: #2d3748 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-blacklist-empty {
                color: #a0aec0 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-blacklist-remove {
                background: #edf2f7 !important;
                color: #718096 !important;
            }

            html.utst-theme-light #utstTranslationBox #settingsPanel #bubbleBlacklistAdd {
                color: #ffffff !important;
            }

            html.utst-theme-light #utstTranslationBox #settingsPanel #bubbleBlacklistAdd:hover {
                color: #ffffff !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-shortcut-capture,
            html.utst-theme-light #utstTranslationBox .utst-shortcut-reset {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
                color: #2d3748 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-shortcut-help {
                color: #718096 !important;
            }

            html.utst-theme-light #utstTranslationBox #settingsHeader {
                background: #ffffff !important;
                border-color: rgba(148, 163, 184, 0.45) !important;
            }

            html.utst-theme-light #utstTranslationBox #settingsPanel {
                background: transparent !important;
            }

            html.utst-theme-light #utstTranslationBox #panelThemeTrigger {
                background: #ffffff !important;
                border: 1px solid #94a3b8 !important;
                color: #2d3748 !important;
            }

            html.utst-theme-light #utstTranslationBox #panelThemePanel {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
            }

            html.utst-theme-light #utstTranslationBox .utst-bubble-settings {
                border-top-color: rgba(74, 85, 104, 0.28) !important;
            }

            html.utst-theme-light #utstTranslationBox #speakTooltip {
                background: #ffffff !important;
                border: 1px solid #e2e8f0 !important;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
            }

            html.utst-theme-light #utstTranslationBox #speakTooltip .utst-speak-option:hover {
                background: rgba(45, 92, 190, 0.14) !important;
                color: #1f3f73 !important;
            }

            html.utst-theme-light #utstTranslationBox #speakTooltip .utst-speak-option + .utst-speak-option {
                border-top-color: rgba(45, 69, 105, .14) !important;
            }

            html.utst-theme-blue #utstTranslationBox #speakTooltip {
                background: rgba(20, 36, 64, 0.98) !important;
                border: 1px solid rgba(139, 177, 255, 0.34) !important;
                box-shadow: 0 10px 24px rgba(6, 15, 35, 0.48) !important;
            }

            html.utst-theme-blue #utstTranslationBox #speakTooltip .utst-speak-option:hover {
                background: rgba(120, 165, 255, 0.22) !important;
                color: #e9f1ff !important;
            }

            html.utst-theme-blue #panelThemePanel {
                background: linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45) !important;
                color: #ffffff !important;
            }

            html.utst-theme-light #fullscreenOverlay {
                background: rgba(0, 0, 0, 0.65) !important;
                backdrop-filter: blur(8px) !important;
            }

            html.utst-theme-light #fullscreenPanel {
                background: linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%) !important;
                border-color: rgba(0, 0, 0, 0.08) !important;
                box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important;
            }

            html.utst-theme-light #fullscreenPanel svg {
                stroke: #4a5568;
            }

            html.utst-theme-light #fullscreenPanel #fullscreenClose svg {
                stroke: #ef4444 !important;
            }

            html.utst-theme-light #fullscreenPanel #fullscreenSourceCopy,
            html.utst-theme-light #fullscreenPanel #fullscreenSourceSpeak,
            html.utst-theme-light #fullscreenPanel #fullscreenSourceDictate,
            html.utst-theme-light #fullscreenPanel #fullscreenTargetCopy,
            html.utst-theme-light #fullscreenPanel #fullscreenTargetSpeak {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
            }

            html.utst-theme-light #fullscreenPanel #fullscreenSourceCopy:hover,
            html.utst-theme-light #fullscreenPanel #fullscreenSourceSpeak:hover,
            html.utst-theme-light #fullscreenPanel #fullscreenSourceDictate:hover,
            html.utst-theme-light #fullscreenPanel #fullscreenTargetCopy:hover,
            html.utst-theme-light #fullscreenPanel #fullscreenTargetSpeak:hover {
                background: #f8fafc !important;
                border-color: #94a3b8 !important;
            }

            html.utst-theme-light #fullscreenPanel textarea,
            html.utst-theme-light #fullscreenPanel input,
            html.utst-theme-light #fullscreenPanel button[id$="LangTrigger"] {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
                color: #2d3748 !important;
            }

            html.utst-theme-light #fullscreenPanel [id$="LangPanel"] {
                background: #ffffff !important;
                border: 1px solid #e2e8f0 !important;
                box-shadow: 0 10px 15px rgba(0,0,0,0.05) !important;
            }

            :host { --utst-touch: 44px; --utst-radius: 14px; }
            [hidden] { display: none !important; }
            :host :is(input, textarea, select):focus,
            :host :is(input, textarea, select):focus-visible {
                outline: none !important;
                outline-offset: 0 !important;
                box-shadow: none !important;
            }
            :host :is(button, [role="button"]):focus,
            :host :is(button, [role="button"]):focus-visible {
                outline: none !important;
                outline-offset: 0 !important;
                box-shadow: none !important;
            }
            #utstTranslationBox .utst-language-trigger:focus,
            #utstTranslationBox .utst-language-trigger:focus-visible,
            #panelThemeTrigger:focus,
            #panelThemeTrigger:focus-visible,
            .utst-inline-lang-panel .inlineLangSearch:focus,
            .utst-inline-lang-panel .inlineLangSearch:focus-visible,
            #fullscreenSourceLangSearch:focus,
            #fullscreenSourceLangSearch:focus-visible,
            #fullscreenTargetLangSearch:focus,
            #fullscreenTargetLangSearch:focus-visible {
                outline: none !important;
                outline-offset: 0 !important;
                box-shadow: none !important;
            }
            #utstTranslationBox #bubbleBlacklistInput:focus,
            #utstTranslationBox #bubbleBlacklistInput:focus-visible {
                outline: none !important;
                box-shadow: none !important;
                border-color: rgba(255, 255, 255, 0.15) !important;
            }
            #utstTranslationBox #translationText:focus,
            #utstTranslationBox #translationText:focus-visible,
            #utstTranslationBox #panelSourceText:focus,
            #utstTranslationBox #panelSourceText:focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }
            :is(button, [role="button"]) { touch-action: manipulation; }
            #utstTranslationBox {
                z-index: 2147483644 !important;
                width: min(420px, calc(var(--utst-vw, 100vw) - 20px)) !important;
                max-width: calc(var(--utst-vw, 100vw) - 20px) !important;
                height: 340px !important;
                min-height: 0 !important;
                overflow: hidden !important;
                padding: 60px 14px 12px !important;
                border-radius: var(--utst-radius) !important;
                overscroll-behavior: contain;
            }
            #dragHandle { height: 48px !important; padding-right: 108px !important; touch-action: none; }
            #panelHeaderActions { height: 48px !important; gap: 4px !important; padding: 0 6px !important; }
            #panelHeaderActions :is(#settingsButton, #closeButton) {
                width: 36px; height: 36px; display: grid !important; place-items: center;
                border-radius: 9px; opacity: .82 !important; flex: 0 0 auto;
                background: transparent !important;
                transition: opacity .16s ease, transform .16s ease !important;
            }
            #panelHeaderActions :is(#settingsButton, #closeButton):hover,
            #panelHeaderActions :is(#settingsButton, #closeButton):active { opacity: 1 !important; transform: none !important; }
            #settingsButton:hover svg { stroke: #65a9ff !important; }
            #panelHeaderActions svg { width: 19px; height: 19px; }
            #panelHeaderActions [role="button"]:hover, #panelTextActions [role="button"]:hover { background: rgba(128,128,160,.16); }
            #translatorPanel:not([style*="display: none"]) { display: flex !important; flex-direction: column; height: 100%; min-height: 0; }
            #panelLanguageRow { gap: 6px; flex-shrink: 0; margin-bottom: 10px !important; }
            .utst-language-picker { position: relative; min-width: 0; flex: 1 1 0; }
            #settingsPanel .utst-language-picker { width: 100%; max-width: 260px; margin: 0 auto; }
            .utst-language-picker select { pointer-events: none; width: 100% !important; max-width: 100% !important; min-width: 0 !important; height: 40px; }
            .utst-language-trigger { position: absolute; inset: 0; width: 100%; border: 0; border-radius: 7px; padding: 0; background: transparent; color: inherit; cursor: pointer; touch-action: pan-y; }
            #panelSwap { flex: 0 0 36px; width: 36px; height: 40px; padding: 0 !important; }
            #panelSourceSection { display: none; }
            #panelSourceActions { display: none; }
            .utst-mobile-section-head { display: none; }
            .utst-compact-actions { display: flex; gap: 2px; }
            .utst-compact-actions button {
                appearance: none; border: 0; background: transparent; color: inherit; padding: 0;
                display: grid; place-items: center; opacity: .72; cursor: pointer;
                transition: opacity .16s ease, transform .16s ease;
            }
            .utst-compact-actions button:hover { opacity: 1; }
            .utst-compact-actions button:active { transform: scale(.9); }
            .utst-compact-actions svg { width: 17px; height: 17px; }
            .utst-copy-success { color: #65d89b !important; opacity: 1 !important; }
            .utst-copy-success svg,
            .utst-copy-success svg * { stroke: #65d89b !important; }
            #translationTextWrap { display: flex; flex-direction: column; flex: 1; min-height: 0; }
            #translationText { flex: 1; min-height: 60px !important; height: auto !important; max-height: none !important; padding: 12px !important; white-space: pre-wrap !important; overflow-wrap: anywhere; unicode-bidi: plaintext; text-align: start !important; }
            #panelTextActions { position: static !important; flex-shrink: 0; padding-top: 8px; gap: 8px; }
            #panelTextActions > div:last-child { gap: 6px !important; }
            #panelTextActions :is(#fullscreenToggle, #panelDictate, #speakButton, #copyButton) {
                width: 36px !important; height: 36px !important; justify-content: center; align-items: center;
                display: grid !important; place-items: center; border: 0; padding: 0; border-radius: 9px; opacity: .9 !important;
            }
            #panelTextActions :is(#fullscreenToggle, #panelDictate, #speakButton, #copyButton) {
                background: transparent !important; transition: opacity .16s ease, transform .16s ease !important;
            }
            #panelTextActions :is(#fullscreenToggle, #panelDictate, #speakButton, #copyButton):hover { opacity: 1 !important; }
            #panelTextActions :is(#fullscreenToggle, #panelDictate, #speakButton, #copyButton):active { transform: scale(.9); }
            #speakTooltip { bottom: 100% !important; right: 0 !important; max-width: 100%; white-space: normal !important; }
            #panelTextActions svg { width: 19px; height: 19px; }
            #utstTranslationBox #settingsHeader { top: 52px !important; left: 12px; right: 12px; height: 44px; padding: 0 6px; }
            #utstTranslationBox #settingsPanel { top: 104px; bottom: 12px; left: 12px; right: 12px; width: auto; min-width: 0 !important; max-width: none !important; padding: 8px 4px 16px !important; overscroll-behavior: contain; }
            #backButton { min-width: 36px !important; width: 36px !important; height: 36px !important; flex-basis: 36px !important; }
            #fullscreenOverlay {
                z-index: 2147483645 !important; width: min(100vw, var(--utst-vw, 100vw)) !important; height: min(100dvh, var(--utst-vh, 100dvh)) !important;
                padding: max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left)) !important;
                overscroll-behavior: contain;
            }
            #fullscreenPanel { max-width: 100% !important; padding: clamp(12px, 3vw, 24px) !important; }
            #fullscreenHeader { min-height: 44px; flex-shrink: 0; gap: 12px; }
            #fullscreenClose { flex-shrink: 0; min-width: 44px; min-height: 44px; }
            #fullscreenSource, #fullscreenTarget { font-family: inherit; text-align: start; unicode-bidi: plaintext; }
            #fullscreenOverlay [role="alert"]:empty { display: none; }
            .utst-fullscreen-actions { justify-content: flex-end; flex-shrink: 0; }
            .utst-inline-lang-panel { z-index: 2147483646 !important; }
            #utstBubbleCloseMenu { max-width: calc(var(--utst-vw, 100vw) - 20px); }
            @media (max-width: 640px), (pointer: coarse) and (max-height: 500px) {
                #fullscreenOverlay { padding: 0 !important; align-items: stretch !important; overflow: hidden !important; }
                #fullscreenPanel {
                    width: 100% !important; height: 100% !important; min-height: 0 !important; max-height: 100% !important;
                    padding: max(8px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)) !important;
                    border-radius: 0 !important; border: 0 !important; display: flex; flex-direction: column; overflow: hidden !important;
                }
                #fullscreenHeader { margin-bottom: 8px !important; }
                #fullscreenTitle { font-size: clamp(14px, 4vw, 17px) !important; }
                #fullscreenColumns { display: grid !important; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(220px, 1fr) 44px minmax(220px, 1fr); gap: 8px !important; min-height: 0 !important; flex: 1; overflow-y: auto; overscroll-behavior: contain; }
                .utst-fullscreen-column { min-height: 0; gap: 8px !important; }
                #fullscreenSwap { align-self: center; justify-self: center; width: 44px !important; height: 44px !important; margin: 0 !important; transform: rotate(calc(90deg + var(--utst-swap-rot, 0deg))) !important; }
                #fullscreenSourceWrap, #fullscreenTargetWrap { flex: 1 !important; min-height: 96px !important; height: auto !important; max-height: none !important; }
                #fullscreenSource, #fullscreenTarget { display: block; height: 100% !important; min-height: 96px !important; max-height: none !important; resize: none !important; font-size: 16px !important; padding: 12px !important; }
                .utst-fullscreen-actions { margin-top: 0 !important; }
                #fullscreenSourceLangPanel, #fullscreenTargetLangPanel { width: min(280px, calc(var(--utst-vw, 100vw) - 24px)) !important; }
            }
            @media (pointer: coarse) and (min-width: 641px) and (max-height: 500px) {
                #fullscreenColumns { grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr); grid-template-rows: minmax(220px, 1fr); }
                #fullscreenSwap { transform: rotate(var(--utst-swap-rot, 0deg)) !important; }
            }
            @media (pointer: coarse), (max-width: 640px) {
                :is(button, [role="button"]) { min-height: var(--utst-touch) !important; min-width: var(--utst-touch) !important; }
                input:not([type="checkbox"]), textarea, select { font-size: 16px !important; }
                .utst-language-picker select { height: 44px; }
                #utstSelectionBubble { height: 48px; }
                #utstTranslationBox { padding-inline: 12px !important; }
                #backButton { flex-basis: 44px !important; }
                #utstTranslationBox {
                    padding-top: 56px !important;
                }
                #utstTranslationBox:not(.utst-settings-open) { height: auto !important; }
                #utstTranslationBox:not(.utst-settings-open) #translatorPanel {
                    height: auto !important; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
                }
                #utstTranslationBox.utst-settings-open { height: min(530px, calc(var(--utst-vh, 100dvh) - 20px)) !important; }
                #panelLanguageRow { margin-bottom: 8px !important; }
                #panelSourceSection {
                    display: flex; flex-direction: column; flex: 0 1 auto; min-height: 70px; max-height: 160px;
                    border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 8px; margin-bottom: 8px;
                }
                #panelSourceActions {
                    display: flex; flex: 0 0 auto; justify-content: flex-end; align-items: center;
                    gap: 6px; min-height: 34px; padding-top: 2px;
                }
                .utst-mobile-section-head {
                    display: flex; min-height: 34px; align-items: center; justify-content: flex-end;
                    gap: 8px; padding: 0 2px; color: rgba(235,238,255,.76); font-size: 12px; font-weight: 650;
                }
                .utst-mobile-section-head > span {
                    display: none !important;
                }
                #panelSourceText {
                    flex: 0 1 auto; min-height: 48px; max-height: 130px; overflow: auto; padding: 8px 2px 4px;
                    line-height: 1.45; overflow-wrap: anywhere; unicode-bidi: plaintext; scrollbar-width: thin;
                }
                #translationTextWrap { flex: 0 1 auto; }
                #utstTranslationBox #translationText,
                html.utst-theme-blue #utstTranslationBox #translationText,
                html.utst-theme-light #utstTranslationBox #translationText {
                    min-height: 62px !important; max-height: 180px !important;
                    padding: 8px 2px 4px !important; background: transparent !important;
                    border: 0 !important; border-radius: 0 !important;
                }
                #panelTargetSectionHead { display: none !important; }
                #panelTextActions { padding-top: 2px; min-height: 34px; }
                #panelTextActions > div:last-child { margin-left: auto; }
                #panelTextActions #fullscreenToggle { display: none !important; }
                #panelSpeakControl.utst-speak-menu-open #speakTooltip { display: flex !important; }
                #shortcutCaptureLabel, .utst-shortcut-control, #shortcutCaptureHelp { display: none !important; }
                #settingsPanel label[for="shortcutCaptureButton"] { display: none !important; }
                #panelSourceActions button, #panelTextActions :is(#speakButton, #copyButton) {
                    appearance: none; border: 0; padding: 0; background: transparent !important; color: inherit;
                    width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important;
                    display: grid !important; place-items: center; border-radius: 9px; opacity: .9;
                    transition: opacity .16s ease, transform .16s ease;
                }
                #panelSourceActions button:hover, #panelTextActions :is(#speakButton, #copyButton):hover { opacity: 1; }
                #panelSourceActions button:active, #panelTextActions :is(#speakButton, #copyButton):active { transform: scale(.9); }
                #panelSourceActions button svg, #panelTextActions :is(#speakButton, #copyButton) svg { width: 18px !important; height: 18px !important; }
                #panelSourceText:focus, #translationText:focus,
                #panelSourceText:focus-visible, #translationText:focus-visible {
                    outline: none !important; box-shadow: none !important;
                }
                #utstTranslationBox .utst-toggle-row--locked { cursor: default !important; }
                #utstTranslationBox .utst-toggle-row input[type="checkbox"]:disabled,
                #utstTranslationBox .utst-toggle-row input[type="checkbox"]:disabled:checked {
                    background: #6f7680 !important;
                    border-color: #89919d !important;
                    box-shadow: none !important;
                    cursor: not-allowed !important;
                    opacity: .72 !important;
                }
            }
            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel #fullscreenPanel .utst-fullscreen-actions > :is(div, button) {
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                opacity: .78 !important;
                transform: none !important;
                transition: opacity .16s ease, background .16s ease !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel #fullscreenPanel .utst-fullscreen-actions > :is(div, button):hover {
                border: 0 !important;
                background: rgba(37, 99, 235, .10) !important;
                box-shadow: none !important;
                opacity: 1 !important;
                transform: none !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel .utst-language-trigger {
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
                color: transparent !important;
                -webkit-text-fill-color: transparent !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel :is(#defaultTranslateLang, #toolLanguage),
            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel :is(#defaultTranslateLang, #toolLanguage) option {
                background: #ffffff !important;
                color: #203150 !important;
                -webkit-text-fill-color: #203150 !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel #selectionBubbleEnabled:not(:disabled):checked {
                background: #2563eb !important;
                border-color: #2563eb !important;
                box-shadow: 0 0 0 2px rgba(37, 99, 235, .18) !important;
                opacity: 1 !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel #selectionBubbleEnabled:not(:disabled):checked::after {
                background: #ffffff !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel.utst-drawer-settings-open #settingsPanel #bubbleBlacklistAdd {
                background: #2563eb !important;
                border-color: #2563eb !important;
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
            }

            #settingsPanel {
                --utst-settings-control-width: 280px;
            }

            #settingsPanel :is(.utst-language-picker, #panelThemePicker) {
                width: min(var(--utst-settings-control-width), 100%) !important;
                max-width: var(--utst-settings-control-width) !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            #settingsPanel .utst-language-picker select,
            #settingsPanel #panelThemeTrigger {
                width: 100% !important;
                min-height: 42px !important;
                height: 42px !important;
                padding: 0 42px 0 13px !important;
                border: 1px solid rgba(255, 255, 255, .16) !important;
                border-radius: 10px !important;
                background-color: rgba(255, 255, 255, .075) !important;
                color: #f4f7ff !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035) !important;
                font-family: inherit !important;
                font-size: 13px !important;
                font-weight: 560 !important;
                line-height: 1.2 !important;
                transition: border-color .16s ease, background-color .16s ease, color .16s ease !important;
            }

            #settingsPanel .utst-language-picker select {
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d9e5ff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E") !important;
                background-position: right 13px center !important;
                background-repeat: no-repeat !important;
                background-size: 16px !important;
            }

            #settingsPanel #panelThemeTrigger {
                position: relative !important;
                justify-content: flex-start !important;
                text-align: left !important;
            }

            #settingsPanel #panelThemeTrigger svg {
                position: absolute !important;
                right: 13px !important;
                width: 16px !important;
                height: 16px !important;
                pointer-events: none !important;
            }

            #settingsPanel :is(.utst-language-picker select, #panelThemeTrigger):hover {
                border-color: rgba(145, 184, 255, .48) !important;
                background-color: rgba(118, 166, 255, .11) !important;
            }

            #settingsPanel #panelThemeTrigger:hover {
                border-color: rgba(255, 255, 255, .16) !important;
                background-color: rgba(255, 255, 255, .075) !important;
            }

            #fullscreenOverlay.utst-drawer-settings-open #settingsPanel .utst-language-picker {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }

            :host(.utst-theme-light) #settingsPanel :is(.utst-language-picker select, #panelThemeTrigger) {
                border-color: #cbd5e1 !important;
                background-color: #ffffff !important;
                color: #203150 !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, .86) !important;
            }

            :host(.utst-theme-light) #settingsPanel .utst-language-picker select {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475b7c' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E") !important;
            }

            :host(.utst-theme-light) #settingsPanel :is(.utst-language-picker select, #panelThemeTrigger):hover {
                border-color: #93b4e7 !important;
                background-color: #f6f9ff !important;
            }

            :host(.utst-theme-light) #settingsPanel #panelThemeTrigger:hover {
                border-color: #cbd5e1 !important;
                background-color: #ffffff !important;
            }

            :host(.utst-theme-light) #panelThemePanel #panelThemeGrid button {
                border-color: #94a3b8 !important;
                background: rgba(45, 92, 190, .06) !important;
                color: #203150 !important;
            }

            :host(.utst-theme-light) #panelThemePanel #panelThemeGrid button[data-theme="light"] {
                border-color: #2d5cbe !important;
                background: rgba(45, 92, 190, .14) !important;
                box-shadow: inset 0 0 0 1px rgba(38, 61, 104, .12) !important;
            }

            :host(.utst-theme-light) #panelThemePanel #panelThemeGrid button:hover {
                border-color: #5279bb !important;
                background: rgba(45, 92, 190, .11) !important;
            }

            #fullscreenOverlay.utst-side-panel .utst-fullscreen-actions > .utst-dictate-button.utst-dictating {
                color: #65a9ff !important;
                border-color: rgba(101, 169, 255, .48) !important;
                background: rgba(101, 169, 255, .12) !important;
            }

            :host(.utst-theme-light) #fullscreenOverlay.utst-side-panel .utst-fullscreen-actions > .utst-dictate-button.utst-dictating {
                color: #2d71c9 !important;
                border-color: rgba(45, 113, 201, .5) !important;
                background: rgba(45, 113, 201, .1) !important;
            }

            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
            }
`;

export function getShadowSafeStyleText(cssText) {
            return cssText.replace(/html\.(utst-theme-[a-z]+)\s+/g, ':host(.$1) ');
        }

export function setImportantStyle(el, prop, value) {
            if (!el) return;
            el.style.setProperty(prop, value, 'important');
        }
