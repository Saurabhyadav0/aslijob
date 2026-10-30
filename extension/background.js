/**
 * AsliJob Extension — Service Worker
 * Implements context menu "Check with AsliJob" calling shared POST /api/check
 */
const API_BASE = "https://aslijob.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aslijob-check-selection",
    title: "Check with AsliJob 🛡️",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "aslijob-check-selection" && info.selectionText) {
    try {
      const response = await fetch(`${API_BASE}/api/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: info.selectionText,
          channel: "extension"
        })
      });

      const data = await response.json();
      if (data && data.checkId) {
        chrome.tabs.create({ url: `${API_BASE}/r/${data.checkId}?ref=ext` });
      }
    } catch (err) {
      console.error("[AsliJob Extension] Check failed:", err);
      // Fallback: open web app with selected text
      chrome.tabs.create({
        url: `${API_BASE}/?text=${encodeURIComponent(info.selectionText)}`
      });
    }
  }
});
