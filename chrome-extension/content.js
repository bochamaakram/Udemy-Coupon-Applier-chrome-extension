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
            console.log(`[Udemy Coupon Applier] Injected successfully into: ${selector}`);
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
                console.log(`[Udemy Coupon Applier] Clicked button: ${selector}`);
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

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 1. PHASE 1: SOURCE SITE (Find Link & Redirect)
    // Runs on any site that isn't Udemy, looking for the specific div
    if (hostname !== 'www.udemy.com') {
        // Try to find the element immediately, or maybe wait a bit if it's dynamic. 
        // The original script just ran on document-idle.
        const sourceDiv = document.querySelector(SOURCE_DIV_SELECTOR);
        if (sourceDiv) {
            console.log('[Udemy Coupon Applier] Source div found.');
            const originalLinkTag = sourceDiv.querySelector('a');
            if (originalLinkTag) {
                // Check if button already exists to avoid duplicates
                if (sourceDiv.querySelector('.udemy-coupon-extension-btn')) return;

                const applyButton = document.createElement('button');
                applyButton.className = 'udemy-coupon-extension-btn'; // Add class for identification
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
                    // Directly redirect
                    window.location.href = targetUrl;
                });
                sourceDiv.appendChild(applyButton);
            }
        }
    }

    // 2. PHASE 2: UDEMY COURSE LANDING PAGE
    else if (hostname === 'www.udemy.com' && !pathname.includes('/payment/checkout')) {
        const coupon = extractCouponCode(window.location.href);
        if (coupon) {
            console.log('[Udemy Coupon Applier] Coupon found in URL:', coupon);
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
                } else {
                     console.log('[Udemy Coupon Applier] Coupon input not found.');
                }
            }, 3000); // Wait for page load
        }
    }

    // 3. PHASE 3: UDEMY CHECKOUT PAGE
    else if (hostname === 'www.udemy.com' && pathname.includes('/payment/checkout')) {
        console.log('[Udemy Coupon Applier] Checkout Page Detected');

        // Check repeatedly for the checkout button
        let checks = 0;
        const maxChecks = 15; // 15 seconds roughly
        
        const checkoutInterval = setInterval(() => {
            checks++;
            const checkoutBtn = document.querySelector(TARGET_FIELDS.CHECKOUT_SUBMIT_BUTTON);

            if (checkoutBtn) {
                clearInterval(checkoutInterval);
                console.log('[Udemy Coupon Applier] Checkout button found. Clicking...');

                // Final safety delay to ensure page is fully interactive
                setTimeout(() => {
                    clickButton(TARGET_FIELDS.CHECKOUT_SUBMIT_BUTTON);
                }, 1500);
            }
            
            if (checks >= maxChecks) {
                 clearInterval(checkoutInterval);
                 console.log('[Udemy Coupon Applier] Checkout button not found after 15s.');
            }
        }, 1000);
    }

})();
