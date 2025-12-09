# 🎓 Udemy Coupon Applier

Automate the process of applying coupons and completing checkout on Udemy courses. Available as both a **Tampermonkey userscript** and a **Chrome extension**.

![Version](https://img.shields.io/badge/version-2.1-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Tampermonkey-blue)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Source Site Detection** | Automatically detects coupon links on deal/coupon websites and injects an "Apply Coupon" button |
| 📝 **Auto Coupon Fill** | Extracts the coupon code from the URL and fills it into Udemy's coupon input field |
| 🛒 **Auto Enroll** | Clicks the "Buy" or "Enroll" button after applying the coupon |
| ✅ **Auto Checkout** | Completes the checkout process automatically on the payment page |

---

## 🚀 How It Works

The automation runs in **3 phases**:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PHASE 1        │     │  PHASE 2        │     │  PHASE 3        │
│  Source Site    │ ──► │  Course Page    │ ──► │  Checkout Page  │
│                 │     │                 │     │                 │
│  Detect coupon  │     │  Fill coupon    │     │  Click checkout │
│  link & redirect│     │  Click enroll   │     │  button         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Phase 1: Source Site
When you visit a coupon deal site that contains Udemy course links with coupons, the script:
- Detects the coupon link container
- Injects a purple "Apply Coupon" button
- Redirects you to Udemy with the coupon code in the URL

### Phase 2: Udemy Course Page
On the Udemy course landing page:
- Extracts the `couponCode` parameter from the URL
- Fills the coupon input field using React-compatible methods
- Clicks the "Apply" button
- Clicks the "Buy/Enroll" button

### Phase 3: Checkout Page
On the Udemy payment/checkout page:
- Waits for the checkout button to appear
- Automatically clicks to complete enrollment

---

## 📦 Installation

### Option 1: Chrome Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `chrome-extension` folder

### Option 2: Tampermonkey Userscript

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click on the Tampermonkey icon → **Create a new script**
3. Copy the contents of `Udemy Coupon Applier (Auto Checkout)-2.0.user.js`
4. Paste and save (Ctrl+S)

---

## 📁 Project Structure

```
Udemy Coupon Applier/
├── README.md
├── Udemy Coupon Applier (Auto Checkout)-2.0.user.js   # Tampermonkey script
└── chrome-extension/
    ├── manifest.json      # Extension configuration
    ├── content.js         # Main automation logic
    ├── popup.html         # Extension popup UI
    └── README.md          # Extension-specific docs
```

---

## 🛠️ Technical Details

### Robust Element Selection

The script uses **multiple fallback selectors** to handle Udemy's dynamic React-based UI:

```javascript
const COUPON_INPUT_SELECTORS = [
    'input[data-purpose="coupon-input"]',      // Primary: data attribute
    'input[name="couponCode"]',                 // Fallback: name attribute
    'form[class*="text-input-form"] input',    // Fallback: partial class match
    // ... more fallbacks
];
```

### React-Compatible Input Handling

Standard `input.value = x` doesn't work with React. The script uses the native setter:

```javascript
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
).set;
nativeInputValueSetter.call(input, value);
input.dispatchEvent(new Event('input', { bubbles: true }));
```

### Smart Element Waiting

Instead of fixed timeouts, the script polls for elements with a maximum wait time:

```javascript
function waitForElement(selectors, callback, maxWait = 15000) {
    const interval = setInterval(() => {
        const element = findElement(selectors);
        if (element) {
            clearInterval(interval);
            callback(element);
        }
    }, 500);
}
```

---

## ⚙️ Configuration

The source site selector can be customized in the script:

```javascript
const SOURCE_DIV_SELECTOR = 'div.priced_block.clearfix.inline_compact_btnblock...';
```

Modify this selector to match the coupon container on your preferred deal site.

---

## 🐛 Debugging

Open the browser console (F12 → Console) to see logs:

```
[Udemy Coupon Extension] Coupon code found: EXAMPLE123
[Udemy Coupon Extension] Found element with selector: input[data-purpose="coupon-input"]
[Udemy Coupon Extension] Injected coupon: EXAMPLE123
[Udemy Coupon Extension] Clicked button: [object HTMLButtonElement]
```

---

## ⚠️ Disclaimer

This tool is for **educational purposes** and personal convenience. Use responsibly and in accordance with Udemy's Terms of Service. The authors are not responsible for any misuse or consequences arising from the use of this tool.

---

## 📄 License

MIT License - feel free to modify and distribute.

---

## 🤝 Contributing

Contributions are welcome! If Udemy updates their UI and breaks the selectors:

1. Inspect the new elements on Udemy
2. Update the selector arrays in `content.js`
3. Submit a pull request

---

Made with ❤️ for Udemy learners
