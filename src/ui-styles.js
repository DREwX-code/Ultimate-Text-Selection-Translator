export const UTST_STYLE_TEXT = `
            :host {
                all: initial !important;
                position: static !important;
                display: contents !important;
                color-scheme: normal !important;
                forced-color-adjust: none !important;
                font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            }

            :host *,
            :host *::before,
            :host *::after {
                box-sizing: border-box !important;
            }

            #closeButton:hover svg {
                stroke: #ff4d4d !important;
                filter: drop-shadow(0 0 4px rgba(255, 77, 77, 0.5));
                transform: scale(1.1);
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .utst-header-logo {
                width: 18px !important;
                height: 18px !important;
                min-width: 18px !important;
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

            @keyframes utst-shimmer {
                0% { background-position: -468px 0; }
                100% { background-position: 468px 0; }
            }

            .utst-loading {
                position: relative !important;
                overflow: hidden !important;
                pointer-events: none !important;
            }

            .utst-loading::after {
                content: "" !important;
                position: absolute !important;
                inset: 0 !important;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%) !important;
                background-size: 468px 100% !important;
                animation: utst-shimmer 1.5s infinite linear !important;
                z-index: 5 !important;
            }

            .utst-panel-light .utst-loading::after {
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(0,0,0,0.05) 50%, rgba(255,255,255,0) 100%) !important;
            }

            .utst-loading-overlay {
                position: absolute !important;
                inset: 0 !important;
                background: rgba(0, 0, 0, 0.2) !important;
                backdrop-filter: blur(2px) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 10px !important;
                z-index: 10 !important;
                pointer-events: none !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
            }

            .utst-loading-active .utst-loading-overlay {
                opacity: 1 !important;
            }

            .utst-loading-shimmer {
                width: 100% !important;
                height: 100% !important;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%) !important;
                background-size: 468px 100% !important;
                animation: utst-shimmer 1.5s infinite linear !important;
            }

            .utst-panel-light .utst-loading-shimmer {
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(0,0,0,0.06) 50%, rgba(255,255,255,0) 100%) !important;
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
                background: rgba(25, 25, 35, 0.85); /* Dark semi-transparent */
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

            #fullscreenPanel {
                width: min(1100px, 95vw) !important;
                max-width: 95vw !important;
                max-height: 92vh !important;
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
                min-height: 200px !important;
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
                width: min(420px, calc(100vw - 20px)) !important;
                min-width: min(420px, calc(100vw - 20px)) !important;
                max-width: min(420px, calc(100vw - 20px)) !important;
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

            #speakTooltip .utst-speak-option:hover {
                background: rgba(255,255,255,0.12);
            }

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
                border-top: 1px solid rgba(255, 255, 255, 0.1);
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
                border-color: #4a90e2;
            }

            #utstTranslationBox select:focus,
            #utstTranslationBox select:focus-visible {
                outline: none !important;
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
                /* Muted deep blue, inspired by the panel but less saturated/flashy */
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
                /* True neutral dark, removing blue tint */
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
                /* Softer, less blinding white - slightly grey/blue tinted off-white */
                background: linear-gradient(135deg, #f0f2f5 0%, #e1e4e8 100%) !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            }

            html.utst-theme-light #utstSelectionBubbleDivider {
                background: rgba(0, 0, 0, 0.1) !important;
            }

            html.utst-theme-light #utstSelectionBubbleAction svg,
            html.utst-theme-light #utstSelectionBubbleClose {
                color: #4a5568 !important; /* Dark grey-blue */
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
                /* Softer light theme background */
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

            /* Ensure ALL icons in the box are dark in light theme */
            html.utst-theme-light #utstTranslationBox svg {
                stroke: #4a5568;
            }
            /* Keep specific icon colors if needed, e.g. close button might be red */
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
            html.utst-theme-light #fullscreenPanel #fullscreenTargetCopy,
            html.utst-theme-light #fullscreenPanel #fullscreenTargetSpeak {
                background: #ffffff !important;
                border: 1px solid #cbd5e0 !important;
            }

            html.utst-theme-light #fullscreenPanel #fullscreenSourceCopy:hover,
            html.utst-theme-light #fullscreenPanel #fullscreenSourceSpeak:hover,
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
            `;

export function getShadowSafeStyleText(cssText) {
            return cssText.replace(/html\.(utst-theme-[a-z]+)\s+/g, ':host(.$1) ');
        }

export function setImportantStyle(el, prop, value) {
            if (!el) return;
            el.style.setProperty(prop, value, 'important');
        }
