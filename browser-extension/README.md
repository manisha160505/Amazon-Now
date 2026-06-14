# Flash Mode Browser Extension

Highlight any text on any webpage → right-click → **"Add to Flash Cart"** → opens the Flash Mode app pre-filled with that situation.

## Demo ideas

- Highlight a recipe ingredient list on a food blog
- Highlight "I have a fever" in a WhatsApp Web chat
- Highlight a party description in an email
- Highlight a product mention on YouTube

## Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this `browser-extension` folder
5. Done! Right-click any selected text on any page and choose **"⚡ Add to Flash Cart"**

## Config

If your React dev server runs on a different URL, update `FLASH_APP_URL` in `background.js`:

```js
const FLASH_APP_URL = "http://localhost:5180/flash";
```

For production, change it to your deployed frontend URL:

```js
const FLASH_APP_URL = "https://your-cloudfront-url.cloudfront.net/flash";
```
