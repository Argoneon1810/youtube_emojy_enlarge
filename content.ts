const styleId: string = "yt-custom-emoji-resizer-style";
let styleEl: HTMLStyleElement | null = document.getElementById(styleId) as HTMLStyleElement | null;

function createStyleElement(height: number): HTMLStyleElement {
  const el = document.createElement("style");
  el.id = styleId;
  el.textContent = `
    yt-emoji-picker-renderer.yt-live-chat-message-input-renderer {
        min-height: ${height}px !important;
        max-height: ${height + 360}px !important;
        margin: 16px -24px 0 !important;
    }
  `;
  return el;
}

function toggleStyle(enabled: boolean, height: number): void {
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  if (enabled) {
    styleEl = createStyleElement(height);
    document.head.appendChild(styleEl);
  }
}

function setHeight(height: number): void {
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
    styleEl = createStyleElement(height);
    document.head.appendChild(styleEl);
  }
}

chrome.storage.local.get(["emojiExpanded", "emojiHeight"], (result: { emojiExpanded?: boolean; emojiHeight?: number }) => {
  const height: number = result.emojiHeight || 520;
  toggleStyle(!!result.emojiExpanded, height);
});

chrome.runtime.onMessage.addListener((request: { action?: string; enabled?: boolean; height?: number }, _sender: chrome.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  if (request.action === "toggleEmoji") {
    chrome.storage.local.get(["emojiHeight"], (r: { emojiHeight?: number }) => {
      toggleStyle(!!request.enabled, r.emojiHeight || 520);
    });
    sendResponse({ success: true });
  } else if (request.action === "setHeight") {
    setHeight(request.height || 520);
    sendResponse({ success: true });
  }
});
