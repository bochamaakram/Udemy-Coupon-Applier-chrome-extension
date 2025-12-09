# Udemy Coupon Applier Extension

A Chrome Extension that automates applying coupons and checking out on Udemy, based on the Tampermonkey script logic.

## Installation

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the `chrome-extension` folder inside this directory.

## Features

- **Source Site**: Automatically detects coupon links on supported deal sites and injects an "Apply Coupon" button.
- **Udemy Course Page**: Automatically enters the coupon code from the URL and clicks "Buy/Enroll".
- **Udemy Checkout**: Automatically clicks the "Checkout" button to complete the purchase.

## Privacy

This extension runs locally on your browser and only interacts with Udemy and the specific source sites to automate clicks/inputs.
