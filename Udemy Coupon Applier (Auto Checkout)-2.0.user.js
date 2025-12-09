// ==UserScript==
// @name         Udemy Coupon Applier (Auto Checkout)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Automates the "Apply Coupon" button, course page enrollment, and the final checkout page using specific classes.
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

    // --- SELECTORS ---
    const TARGET_FIELDS = {
        // Course Landing Page
        COUPON_INPUT: 'form.text-input-form-module--text-input-form--tITHD input.ud-text-input.ud-text-input-medium.ud-text-sm',
        LANDING_PAGE_BUTTON: 'div.buy-button.buy-box--buy-box-item--wT5bJ.buy-box--buy-button--m373K button',

        // Checkout Page (Final Step)
        // Updated to use the specific class provided.
        // Note: Spaces in class names must be replaced with dots (.) for the selector to work.
        CHECKOUT_SUBMIT_BUTTON: 'button.ud-btn.ud-btn-large.ud-btn-brand.ud-btn-text-md.checkout-button--checkout-button--button--XFnK-'
    };

    // --- HELPER FUNCTIONS ---

    function setInputValue(selector, value) {
        const input = document.querySelector(selector);
        if (input && value) {
            input.focus();
            input.value = value;
            input.blur();
            ['change', 'input', 'propertychange', 'keyup'].forEach(eventName => {
                input.dispatchEvent(new Event(eventName, { bubbles: true }));
            });
            console.log(`Injected successfully into: ${selector}`);
            return true;
        }
        return false;
    }

    function clickButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                button.click();
                console.log(`Clicked button: ${selector}`);
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

    // --- MAIN LOGIC ---

    // 1. PHASE 1: SOURCE SITE (Find Link & Redirect)
    const sourceDiv = document.querySelector(SOURCE_DIV_SELECTOR);
    if (sourceDiv && window.location.hostname !== 'www.udemy.com') {
        const originalLinkTag = sourceDiv.querySelector('a');
        if (originalLinkTag) {
            const applyButton = document.createElement('button');
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

    // 2. PHASE 2: UDEMY COURSE LANDING PAGE (Inject & Click "Buy/Enroll")
    else if (window.location.hostname === 'www.udemy.com' && !window.location.pathname.includes('/payment/checkout')) {
        const coupon = extractCouponCode(window.location.href);
        if (coupon) {
            setTimeout(() => {
                const input = document.querySelector(TARGET_FIELDS.COUPON_INPUT);
                if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        if (setInputValue(TARGET_FIELDS.COUPON_INPUT, coupon)) {
                            // Wait for Udemy to validate coupon (approx 1s), then click button
                            setTimeout(() => {
                                clickButton(TARGET_FIELDS.LANDING_PAGE_BUTTON);
                            }, 1000);
                        }
                    }, 500);
                }
            }, 3000); // Wait for page load
        }
    }

    // 3. PHASE 3: UDEMY CHECKOUT PAGE (Final Enrollment)
    else if (window.location.hostname === 'www.udemy.com' && window.location.pathname.includes('/payment/checkout')) {
        console.log('--- Detected Payment/Checkout Page ---');

        // Check repeatedly for the checkout button
        const checkoutInterval = setInterval(() => {
            const checkoutBtn = document.querySelector(TARGET_FIELDS.CHECKOUT_SUBMIT_BUTTON);

            if (checkoutBtn) {
                clearInterval(checkoutInterval);
                console.log('Checkout button found. Clicking...');

                // Final safety delay to ensure page is fully interactive
                setTimeout(() => {
                    clickButton(TARGET_FIELDS.CHECKOUT_SUBMIT_BUTTON);
                }, 1500);
            }
        }, 1000);

        // Stop checking after 15 seconds
        setTimeout(() => clearInterval(checkoutInterval), 15000);
    }

})();