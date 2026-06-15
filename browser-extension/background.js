// Flash Mode Browser Extension
// Right-click selected text → "Add to Flash Cart" opens the React app pre-filled.

const FLASH_APP_URL = "http://localhost:5173/flash";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "flash-mode-add-to-cart",
    title: "⚡ Add to Flash Cart",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "flash-mode-add-to-cart") return;

  const selectedText = info.selectionText?.trim();
  if (!selectedText) return;

  const url = `${FLASH_APP_URL}?prefill=${encodeURIComponent(selectedText)}`;

  // Open in a new tab
  chrome.tabs.create({ url });
});
