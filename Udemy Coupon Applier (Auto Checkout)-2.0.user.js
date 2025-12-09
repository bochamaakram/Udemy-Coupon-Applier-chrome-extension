// ==UserScript==
// @name         Udemy Coupon Applier (Auto Checkout)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automates the "Apply Coupon" button, course page enrollment, and the final checkout page.
// @author       You
// @match        *://*/*
// @match        https://www.udemy.com/course/*
// @match        https://www.udemy.com/payment/checkout/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const SOURCE_DIV_SELECTOR = 'div.priced_block.clearfix.inline_compact_btnblock.mobile_block_btnclock.mb0';
    const COUPON_KEY = 'couponCode';

    // --- FALLBACK SELECTORS (multiple options for robustness) ---
    const COUPON_INPUT_SELECTORS = [
        'input[data-purpose="coupon-input"]',
        'input[name="couponCode"]',
        'form[class*="text-input-form"] input[type="text"]',
        'input.ud-text-input[placeholder*="coupon" i]',
        'input.ud-text-input[placeholder*="Enter Coupon" i]',
        '[class*="coupon"] input[type="text"]',
        'input.ud-text-input.ud-text-input-medium'
    ];

    const APPLY_COUPON_BUTTON_SELECTORS = [
        'button[data-purpose="coupon-submit"]',
        'form[class*="text-input-form"] button[type="submit"]',
        'button.ud-btn[type="submit"]',
        '[class*="coupon"] button[type="submit"]'
    ];

    const BUY_BUTTON_SELECTORS = [
        'button[data-purpose="buy-this-course-button"]',
        'button[data-purpose="add-to-cart-button"]',
        '[class*="buy-button"] button',
        '[class*="buy-box"] button.ud-btn-brand',
        'button.ud-btn.ud-btn-large.ud-btn-brand[class*="buy"]',
        '[class*="purchase"] button.ud-btn-brand'
    ];

    const ENROLL_BUTTON_SELECTORS = [
        'button[data-purpose="enroll-button"]',
        'button[data-purpose="buy-this-course-button"]',
        '[class*="enroll"] button.ud-btn-brand',
        'button.ud-btn.ud-btn-large.ud-btn-brand'
    ];

    const CHECKOUT_BUTTON_SELECTORS = [
        'button[data-purpose="checkout-submit-button"]',
        'button[class*="checkout-button"]',
        'button.ud-btn.ud-btn-large.ud-btn-brand[type="submit"]',
        '[class*="checkout"] button.ud-btn-brand',
        'form button.ud-btn.ud-btn-large.ud-btn-brand'
    ];

    // --- HELPER FUNCTIONS ---

    function findElement(selectors) {
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                console.log(`[Udemy Coupon] Found element with selector: ${selector}`);
                return el;
            }
        }
        console.log('[Udemy Coupon] No element found for selectors:', selectors);
        return null;
    }

    function setInputValue(input, value) {
        if (input && value) {
            input.focus();
            // Clear existing value
            input.value = '';
            // Use native input value setter for React
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, value);
            // Dispatch events
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            console.log(`[Udemy Coupon] Injected coupon: ${value}`);
            return true;
        }
        return false;
    }

    function clickButton(button) {
        if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                button.click();
                console.log('[Udemy Coupon] Clicked button:', button);
            }, 300);
            return true;
        }
        return false;
    }

    function extractCouponCode(url) {
        try {
            return new URL(url).searchParams.get(COUPON_KEY);
        } catch (e) {
            return null;
        }
    }

    function waitForElement(selectors, callback, maxWait = 15000) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = findElement(selectors);
            if (element) {
                clearInterval(interval);
                callback(element);
            } else if (Date.now() - startTime > maxWait) {
                clearInterval(interval);
                console.log('[Udemy Coupon] Timeout waiting for element');
            }
        }, 500);
    }

    // --- MAIN LOGIC ---
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 1. PHASE 1: SOURCE SITE (Find Link & Redirect)
    if (hostname !== 'www.udemy.com') {
        const sourceDiv = document.querySelector(SOURCE_DIV_SELECTOR);
        if (sourceDiv) {
            const originalLinkTag = sourceDiv.querySelector('a');
            if (originalLinkTag && !sourceDiv.querySelector('.udemy-coupon-btn')) {
                const applyButton = document.createElement('button');
                applyButton.className = 'udemy-coupon-btn';
                applyButton.textContent = 'Apply Coupon';
                applyButton.style.cssText = `
                    display: inline-block; margin-left: 10px; padding: 10px 15px;
                    background-color: #a435f0; color: white; border: none; border-radius: 4px;
                    cursor: pointer; font-weight: bold; font-size: 14px; z-index: 9999;
                `;

                applyButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetUrl = originalLinkTag.href;
                    if (!targetUrl) return;

                    applyButton.textContent = 'Redirecting...';
                    applyButton.disabled = true;
                    window.location.href = targetUrl;
                });
                sourceDiv.appendChild(applyButton);
            }
        }
    }

    // 2. PHASE 2: UDEMY COURSE LANDING PAGE
    else if (hostname === 'www.udemy.com' && pathname.includes('/course/') && !pathname.includes('/payment/')) {
        const coupon = extractCouponCode(window.location.href);
        if (coupon) {
            console.log('[Udemy Coupon] Coupon code found:', coupon);

            // Wait for page to fully load
            setTimeout(() => {
                // First, try to find and fill the coupon input
                waitForElement(COUPON_INPUT_SELECTORS, (input) => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    setTimeout(() => {
                        if (setInputValue(input, coupon)) {
                            // Click Apply button
                            setTimeout(() => {
                                const applyBtn = findElement(APPLY_COUPON_BUTTON_SELECTORS);
                                if (applyBtn) {
                                    clickButton(applyBtn);

                                    // After applying coupon, click Buy/Enroll button
                                    setTimeout(() => {
                                        const buyBtn = findElement(BUY_BUTTON_SELECTORS) || findElement(ENROLL_BUTTON_SELECTORS);
                                        if (buyBtn) {
                                            clickButton(buyBtn);
                                        }
                                    }, 2000);
                                }
                            }, 500);
                        }
                    }, 500);
                }, 10000);
            }, 2000);
        } else {
            console.log('[Udemy Coupon] No coupon code in URL');
        }
    }

    // 3. PHASE 3: UDEMY CHECKOUT PAGE
    else if (hostname === 'www.udemy.com' && pathname.includes('/payment/checkout')) {
        console.log('[Udemy Coupon] Checkout page detected');

        waitForElement(CHECKOUT_BUTTON_SELECTORS, (checkoutBtn) => {
            console.log('[Udemy Coupon] Checkout button found');

            // Final safety delay
            setTimeout(() => {
                clickButton(checkoutBtn);
            }, 1500);
        }, 15000);
    }

})();