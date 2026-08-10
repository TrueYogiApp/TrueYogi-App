
/**
 * TrueYogi Onboarding Walkthrough - WITH CLOSE BUTTON
 * ONLY starts after welcome modal is closed
 */

(function() {
    'use strict';

    // ─── CONFIG ────────────────────────────────────────────────────────────────
    const STEPS = [{
        id: 'step-1',
        target: '#flow-mode-btn-select',
        title: '🌿 Begin Your Practice',
        description: 'Choose Flow for daily meditation or TrueYogi to start your 41-Day Challenge.',
        buttons: ['skip', 'next']
    }, {
        id: 'step-2',
        target: '#wallet-action-btn',
        title: '🔗 Connect Your Wallet',
        description: 'Connect your wallet to unlock YOGI token rewards. (Optional)',
        buttons: ['back', 'next']
    }, {
        id: 'step-3',
        target: '#lang-switch',
        title: '🌍 Your Language',
        description: 'Change the app language anytime from here.',
        buttons: ['back', 'next']
    }, {	
        id: 'step-4',
        target: '#faq-tab',
        title: '❓ Need Help?',
        description: 'Find answers about meditation, challenges, rewards and other features.',
        buttons: ['back', 'finish']
    }];

    const STORAGE_KEY = 'walkthroughCompleted';
    const OVERLAY_ID = 'tw-overlay';
    const TOOLTIP_ID = 'tw-tooltip';
    const HIGHLIGHT_ID = 'tw-highlight';
    const DELAY_MS = 3000; // 3 seconds

    let currentStep = 0;
    let overlay = null;
    let tooltip = null;
    let highlight = null;
    let resizeTimer = null;
    let isActive = false;
    let startTimer = null;
    let isWaitingForModal = false;

    // ─── STYLES (injected) ──────────────────────────────────────────────────
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'tw-styles';
        style.textContent = `
            #${OVERLAY_ID} {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 999999;
                background: rgba(0, 0, 0, 0.35);
                backdrop-filter: blur(0px);
                -webkit-backdrop-filter: blur(0.5px);
                transition: opacity 0.4s ease;
                opacity: 0;
                pointer-events: none;
                will-change: opacity;
            }
            #${OVERLAY_ID}.active {
                opacity: 1;
                pointer-events: auto;
            }

            #${HIGHLIGHT_ID} {
                position: fixed;
                z-index: 1000000;
                border-radius: 12px;
                box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.35);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
                opacity: 0;
                will-change: transform, opacity, width, height, top, left;
            }
            #${HIGHLIGHT_ID}.visible {
                opacity: 1;
            }

            #${TOOLTIP_ID} {
                position: fixed;
                z-index: 1000001;
                max-width: 380px;
                width: calc(100% - 40px);
                background: #ffffff;
                border-radius: 20px;
                padding: 28px 26px 22px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.30), 0 6px 20px rgba(0, 0, 0, 0.12);
                opacity: 0;
                transform: translateY(12px) scale(0.96);
                transition: opacity 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
                will-change: transform, opacity;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #1e1e2e;
                box-sizing: border-box;
            }
            #${TOOLTIP_ID}.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            /* Close Button */
            #${TOOLTIP_ID} .tw-close-btn {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                font-size: 22px;
                color: #8e8ea3;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 50%;
                transition: all 0.2s ease;
                line-height: 1;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10;
            }

            #${TOOLTIP_ID} .tw-close-btn:hover {
                color: #1e1e2e;
                background: rgba(0, 0, 0, 0.06);
                transform: rotate(90deg);
            }

            #${TOOLTIP_ID} .tw-close-btn:active {
                transform: scale(0.9);
            }

            #${TOOLTIP_ID} .tw-title {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 6px 0;
                letter-spacing: -0.3px;
                line-height: 1.3;
                color: #0b0b14;
                padding-right: 30px; /* Make room for close button */
            }
            #${TOOLTIP_ID} .tw-desc {
                font-size: 15px;
                line-height: 1.7;
                margin: 0 0 20px 0;
                color: #2d2d44;
                font-weight: 450;
                opacity: 0.95;
                letter-spacing: 0.02em;
                background: rgba(108, 92, 231, 0.05);
                padding: 12px 16px;
                border-radius: 12px;
                border-left: 3px solid #6c5ce7;
            }
            #${TOOLTIP_ID} .tw-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: flex-end;
                align-items: center;
                margin-top: 6px;
            }
            #${TOOLTIP_ID} .tw-btn {
                background: transparent;
                border: none;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
                border-radius: 40px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
                letter-spacing: 0.3px;
                color: #4a4a62;
                background: #f2f2f7;
                min-width: 64px;
                text-align: center;
            }
            #${TOOLTIP_ID} .tw-btn:hover {
                background: #e6e6ee;
                transform: scale(0.97);
            }
            #${TOOLTIP_ID} .tw-btn:active {
                transform: scale(0.94);
            }
            #${TOOLTIP_ID} .tw-btn-primary {
                background: #6c5ce7;
                color: #fff;
                box-shadow: 0 4px 12px rgba(108, 92, 231, 0.30);
            }
            #${TOOLTIP_ID} .tw-btn-primary:hover {
                background: #5f4ddb;
                box-shadow: 0 6px 16px rgba(108, 92, 231, 0.35);
            }
            #${TOOLTIP_ID} .tw-btn-primary:active {
                background: #5244c7;
            }
            #${TOOLTIP_ID} .tw-btn-skip {
                background: transparent;
                color: #8e8ea3;
                font-weight: 500;
            }
            #${TOOLTIP_ID} .tw-btn-skip:hover {
                background: rgba(0,0,0,0.04);
                color: #5a5a72;
            }
            #${TOOLTIP_ID} .tw-btn-back {
                background: transparent;
                color: #6c5ce7;
                font-weight: 500;
            }
            #${TOOLTIP_ID} .tw-btn-back:hover {
                background: rgba(108, 92, 231, 0.08);
            }

            #${TOOLTIP_ID} .tw-arrow {
                position: absolute;
                width: 16px;
                height: 16px;
                background: #ffffff;
                transform: rotate(45deg);
                box-shadow: -3px -3px 8px rgba(0, 0, 0, 0.04);
                pointer-events: none;
                transition: all 0.25s ease;
            }
            #${TOOLTIP_ID}[data-placement="bottom"] .tw-arrow {
                top: -7px;
                left: 50%;
                margin-left: -8px;
                box-shadow: -3px -3px 8px rgba(0, 0, 0, 0.06);
            }
            #${TOOLTIP_ID}[data-placement="top"] .tw-arrow {
                bottom: -7px;
                left: 50%;
                margin-left: -8px;
                box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.06);
            }
            #${TOOLTIP_ID}[data-placement="left"] .tw-arrow {
                right: -7px;
                top: 50%;
                margin-top: -8px;
                box-shadow: 3px -3px 8px rgba(0, 0, 0, 0.06);
            }
            #${TOOLTIP_ID}[data-placement="right"] .tw-arrow {
                left: -7px;
                top: 50%;
                margin-top: -8px;
                box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.06);
            }

            @media (max-width: 500px) {
                #${TOOLTIP_ID} {
                    padding: 22px 18px 18px;
                    max-width: 340px;
                    width: calc(100% - 28px);
                }
                #${TOOLTIP_ID} .tw-title {
                    font-size: 18px;
                }
                #${TOOLTIP_ID} .tw-desc {
                    font-size: 14px;
                }
                #${TOOLTIP_ID} .tw-btn {
                    padding: 6px 14px;
                    font-size: 13px;
                    min-width: 56px;
                }
                #${TOOLTIP_ID} .tw-actions {
                    gap: 6px;
                }
                #${TOOLTIP_ID} .tw-close-btn {
                    top: 10px;
                    right: 12px;
                    font-size: 20px;
                    padding: 2px 6px;
                }
            }
            @media (max-width: 380px) {
                #${TOOLTIP_ID} {
                    padding: 18px 14px 16px;
                    max-width: 300px;
                }
                #${TOOLTIP_ID} .tw-title {
                    font-size: 16px;
                }
                #${TOOLTIP_ID} .tw-desc {
                    font-size: 13px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ─── DOM HELPERS ─────────────────────────────────────────────────────────
    function getTargetElement(selector) {
        return document.querySelector(selector);
    }

    function getRect(el) {
        return el.getBoundingClientRect();
    }

    function isElementReady(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function isWelcomeModalVisible() {
        const modal = document.getElementById('welcome-message');
        if (!modal) return false;
        return !modal.classList.contains('hidden');
    }

    // ─── OVERLAY ─────────────────────────────────────────────────────────────
    function createOverlay() {
        if (document.getElementById(OVERLAY_ID)) return;
        overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        document.body.appendChild(overlay);
        void overlay.offsetWidth;
        overlay.classList.add('active');
    }

    function destroyOverlay() {
        const el = document.getElementById(OVERLAY_ID);
        if (el) {
            el.classList.remove('active');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 400);
        }
        overlay = null;
    }

    // ─── HIGHLIGHT ────────────────────────────────────────────────────────────
    function createHighlight() {
        if (document.getElementById(HIGHLIGHT_ID)) return;
        highlight = document.createElement('div');
        highlight.id = HIGHLIGHT_ID;
        document.body.appendChild(highlight);
    }

    function updateHighlight(rect) {
        if (!highlight) return;
        
        highlight.style.willChange = 'transform, top, left, width, height';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        
        void highlight.offsetHeight;
        highlight.classList.add('visible');
    }

    function hideHighlight() {
        if (highlight) {
            highlight.classList.remove('visible');
        }
    }

    function destroyHighlight() {
        const el = document.getElementById(HIGHLIGHT_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
        highlight = null;
    }

    // ─── TOOLTIP ──────────────────────────────────────────────────────────────
    function createTooltip() {
        if (document.getElementById(TOOLTIP_ID)) return;
        tooltip = document.createElement('div');
        tooltip.id = TOOLTIP_ID;
        tooltip.setAttribute('role', 'dialog');
        tooltip.setAttribute('aria-modal', 'true');
        const arrow = document.createElement('div');
        arrow.className = 'tw-arrow';
        tooltip.appendChild(arrow);
        const content = document.createElement('div');
        content.className = 'tw-content';
        tooltip.appendChild(content);
        document.body.appendChild(tooltip);
    }

    function renderTooltip(stepIndex) {
        if (!tooltip) return;
        const step = STEPS[stepIndex];
        if (!step) return;

        const content = tooltip.querySelector('.tw-content');
        if (!content) return;

        const btnMap = {
            skip: { label: 'Skip', class: 'tw-btn-skip', action: 'skip' },
            next: { label: 'Next', class: 'tw-btn-primary', action: 'next' },
            back: { label: 'Back', class: 'tw-btn-back', action: 'back' },
            finish: { label: 'Finish', class: 'tw-btn-primary', action: 'finish' }
        };

        // ─── ADDED CLOSE BUTTON ──────────────────────────────────────────────
        let html = `
            <button class="tw-close-btn" data-action="skip" aria-label="Close walkthrough">✕</button>
            <div class="tw-title">${step.title}</div>
            <div class="tw-desc">${step.description}</div>
            <div class="tw-actions">
        `;

        step.buttons.forEach(key => {
            const btn = btnMap[key];
            if (!btn) return;
            html += `<button class="tw-btn ${btn.class}" data-action="${btn.action}">${btn.label}</button>`;
        });

        html += `</div>`;
        content.innerHTML = html;

        // ─── EVENT LISTENERS FOR ALL BUTTONS INCLUDING CLOSE ────────────────
        content.querySelectorAll('.tw-btn, .tw-close-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.dataset.action;
                handleAction(action);
            });
        });
    }

    function positionTooltip(targetRect) {
        if (!tooltip) return;
        const tw = tooltip;
        tw.style.opacity = '0';
        tw.style.transform = 'none';
        tw.style.pointerEvents = 'none';
        tw.classList.remove('visible');
        tw.style.display = 'block';

        const twRect = tw.getBoundingClientRect();
        const twW = twRect.width;
        const twH = twRect.height;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 20;
        const gap = 18;

        const spaceAbove = targetRect.top - margin;
        const spaceBelow = vh - targetRect.bottom - margin;
        const spaceLeft = targetRect.left - margin;
        const spaceRight = vw - targetRect.right - margin;

        let bestPlacement = 'bottom';
        if (spaceBelow < twH + gap && spaceAbove > spaceBelow) {
            bestPlacement = 'top';
        } else if (spaceBelow < twH + gap && spaceAbove < twH + gap && spaceRight > spaceLeft) {
            bestPlacement = 'right';
        } else if (spaceBelow < twH + gap && spaceAbove < twH + gap && spaceLeft > spaceRight) {
            bestPlacement = 'left';
        }

        let top, left, arrowOffset = 0;

        switch (bestPlacement) {
            case 'bottom':
                top = targetRect.bottom + gap;
                left = targetRect.left + targetRect.width / 2 - twW / 2;
                if (left + twW > vw - margin) left = vw - twW - margin;
                if (left < margin) left = margin;
                arrowOffset = (targetRect.left + targetRect.width / 2) - left;
                arrowOffset = Math.max(20, Math.min(twW - 20, arrowOffset));
                break;
            case 'top':
                top = targetRect.top - twH - gap;
                left = targetRect.left + targetRect.width / 2 - twW / 2;
                if (left + twW > vw - margin) left = vw - twW - margin;
                if (left < margin) left = margin;
                arrowOffset = (targetRect.left + targetRect.width / 2) - left;
                arrowOffset = Math.max(20, Math.min(twW - 20, arrowOffset));
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2 - twH / 2;
                left = targetRect.right + gap;
                if (top + twH > vh - margin) top = vh - twH - margin;
                if (top < margin) top = margin;
                arrowOffset = (targetRect.top + targetRect.height / 2) - top;
                arrowOffset = Math.max(20, Math.min(twH - 20, arrowOffset));
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - twH / 2;
                left = targetRect.left - twW - gap;
                if (top + twH > vh - margin) top = vh - twH - margin;
                if (top < margin) top = margin;
                arrowOffset = (targetRect.top + targetRect.height / 2) - top;
                arrowOffset = Math.max(20, Math.min(twH - 20, arrowOffset));
                break;
        }

        tw.style.top = top + 'px';
        tw.style.left = left + 'px';
        tw.setAttribute('data-placement', bestPlacement);

        const arrow = tw.querySelector('.tw-arrow');
        if (arrow) {
            arrow.style.top = '';
            arrow.style.left = '';
            arrow.style.right = '';
            arrow.style.bottom = '';
            arrow.style.margin = '';

            switch (bestPlacement) {
                case 'bottom':
                    arrow.style.top = '-7px';
                    arrow.style.left = arrowOffset + 'px';
                    arrow.style.marginLeft = '-8px';
                    break;
                case 'top':
                    arrow.style.bottom = '-7px';
                    arrow.style.left = arrowOffset + 'px';
                    arrow.style.marginLeft = '-8px';
                    break;
                case 'right':
                    arrow.style.left = '-7px';
                    arrow.style.top = arrowOffset + 'px';
                    arrow.style.marginTop = '-8px';
                    break;
                case 'left':
                    arrow.style.right = '-7px';
                    arrow.style.top = arrowOffset + 'px';
                    arrow.style.marginTop = '-8px';
                    break;
            }
        }

        tw.style.display = '';
        tw.style.opacity = '';
        tw.style.transform = '';
        tw.style.pointerEvents = '';
        tw.classList.add('visible');
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    function destroyTooltip() {
        const el = document.getElementById(TOOLTIP_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
        tooltip = null;
    }

    // ─── Show FAQ tab temporarily ───────────────────────────────────────────
    function showFaqTabForWalkthrough() {
        const faqTab = document.querySelector('#faq-tab');
        if (faqTab) {
            if (!faqTab.dataset.originalDisplay) {
                faqTab.dataset.originalDisplay = faqTab.style.display || getComputedStyle(faqTab).display;
            }
            faqTab.style.display = 'block';
            void faqTab.offsetHeight;
        }
    }

    function restoreFaqTabDisplay() {
        const faqTab = document.querySelector('#faq-tab');
        if (faqTab && faqTab.dataset.originalDisplay) {
            faqTab.style.display = faqTab.dataset.originalDisplay;
            delete faqTab.dataset.originalDisplay;
        }
    }

    function setupResizeObserver() {
        if (!window.ResizeObserver) return;
        
        const resizeObserver = new ResizeObserver(function() {
            if (isActive && currentStep < STEPS.length) {
                const step = STEPS[currentStep];
                if (step) {
                    const target = getTargetElement(step.target);
                    if (target && isElementReady(target)) {
                        const rect = getRect(target);
                        updateHighlight(rect);
                        positionTooltip(rect);
                    }
                }
            }
        });
        
        const step = STEPS[currentStep];
        if (step) {
            const target = getTargetElement(step.target);
            if (target) {
                resizeObserver.observe(target);
            }
        }
        
        return resizeObserver;
    }

    // ─── CORE LOGIC ──────────────────────────────────────────────────────────
    function showStep(index) {
        if (!isActive) return;
        const step = STEPS[index];
        if (!step) return;

        if (index === 3) { // FAQ tab is step 4 (index 3)
            showFaqTabForWalkthrough();
        }

        const target = getTargetElement(step.target);
        
        if (!target || !isElementReady(target)) {
            if (index === 3) {
                setTimeout(() => {
                    if (isActive) showStep(index);
                }, 300);
                return;
            }
            if (index < STEPS.length - 1) {
                showStep(index + 1);
            } else {
                finishWalkthrough();
            }
            return;
        }

        currentStep = index;
        const rect = getRect(target);
        updateHighlight(rect);
        renderTooltip(index);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!isActive) return;
                positionTooltip(rect);
            });
        });

        if (window._resizeObserver) {
            window._resizeObserver.disconnect();
        }
        window._resizeObserver = setupResizeObserver();
    }

    function handleAction(action) {
        switch (action) {
            case 'skip':
            case 'finish':
                finishWalkthrough();
                break;
            case 'next':
                if (currentStep < STEPS.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                } else {
                    finishWalkthrough();
                }
                break;
            case 'back':
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
                break;
        }
    }

    function finishWalkthrough() {
        if (!isActive) return;
        isActive = false;
        localStorage.setItem(STORAGE_KEY, 'true');
        restoreFaqTabDisplay();
        hideTooltip();
        hideHighlight();
        destroyOverlay();
        destroyHighlight();
        destroyTooltip();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll, true);
        document.removeEventListener('keydown', onKeydown);
        if (startTimer) {
            clearTimeout(startTimer);
            startTimer = null;
        }
        isWaitingForModal = false;
        if (window._resizeObserver) {
            window._resizeObserver.disconnect();
            window._resizeObserver = null;
        }
    }

    function onResize() {
        if (!isActive) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isActive && currentStep < STEPS.length) {
                const step = STEPS[currentStep];
                if (step) {
                    const target = getTargetElement(step.target);
                    if (target && isElementReady(target)) {
                        positionTooltip(getRect(target));
                    }
                }
            }
        }, 100);
    }

    function onScroll() {
        if (!isActive) return;
        
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        
        if (currentStep < STEPS.length) {
            const step = STEPS[currentStep];
            if (step) {
                const target = getTargetElement(step.target);
                if (target && isElementReady(target)) {
                    const rect = getRect(target);
                    updateHighlight(rect);
                    positionTooltip(rect);
                }
            }
        }
    }

    function onKeydown(e) {
        if (!isActive) return;
        if (e.key === 'Escape') {
            finishWalkthrough();
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            if (currentStep < STEPS.length - 1) {
                currentStep++;
                showStep(currentStep);
                e.preventDefault();
            } else {
                finishWalkthrough();
                e.preventDefault();
            }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
                e.preventDefault();
            }
        }
    }

    // ─── WALKTHROUGH START ──────────────────────────────────────────────────
    function startWalkthrough() {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            return;
        }
        
        if (isActive) {
            return;
        }

        if (isWelcomeModalVisible()) {
            isWaitingForModal = true;
            return;
        }

        if (!document.getElementById('tw-styles')) {
            injectStyles();
        }

        isActive = true;
        isWaitingForModal = false;
        currentStep = 0;

        createOverlay();
        createHighlight();
        createTooltip();

        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true, capture: true });
        document.addEventListener('keydown', onKeydown);

        setTimeout(() => {
            if (isActive) showStep(0);
        }, 500);
    }

    function scheduleWalkthrough() {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            return;
        }
        
        if (isWelcomeModalVisible()) {
            isWaitingForModal = true;
            return;
        }

        if (startTimer) {
            clearTimeout(startTimer);
            startTimer = null;
        }
        
        startTimer = setTimeout(function() {
            startWalkthrough();
            startTimer = null;
        }, DELAY_MS);
    }

    // ─── HOOK INTO YOUR EXISTING closeWelcomeMessage ──────────────────────
    function hookIntoCloseWelcome() {
        const originalClose = window.closeWelcomeMessage;

        if (typeof originalClose === 'function') {
            window.closeWelcomeMessage = function() {
                originalClose.apply(this, arguments);
                isWaitingForModal = false;
                
                setTimeout(function() {
                    if (!localStorage.getItem(STORAGE_KEY)) {
                        scheduleWalkthrough();
                    }
                }, 300);
            };
        }
    }

    // ─── INIT ────────────────────────────────────────────────────────────────
    function init() {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(hookIntoCloseWelcome, 500);
                
                setTimeout(function() {
                    if (!localStorage.getItem(STORAGE_KEY)) {
                        if (isWelcomeModalVisible()) {
                            isWaitingForModal = true;
                        } else {
                            scheduleWalkthrough();
                        }
                    }
                }, 1000);
            });
        } else {
            setTimeout(hookIntoCloseWelcome, 500);
            
            setTimeout(function() {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    if (isWelcomeModalVisible()) {
                        isWaitingForModal = true;
                    } else {
                        scheduleWalkthrough();
                    }
                }
            }, 1000);
        }
    }

    // ─── EXPOSE ──────────────────────────────────────────────────────────────
    window.startWalkthrough = startWalkthrough;
    window.scheduleWalkthrough = scheduleWalkthrough;

    // Start
    init();

})();