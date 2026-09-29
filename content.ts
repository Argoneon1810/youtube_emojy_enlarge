const styleId: string = "yt-custom-emoji-resizer-style";
const handleId: string = "yt-custom-emoji-resize-handle";
let currentHeight: number = 520;
let isDragging: boolean = false;
let dragStartY: number = 0;
let dragStartHeight: number = 0;

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

function applyHeight(height: number): void {
  currentHeight = Math.max(200, Math.min(880, height));
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  const styleEl = createStyleElement(currentHeight);
  document.head.appendChild(styleEl);
}

function createHandle(): HTMLDivElement {
  const handle = document.createElement("div");
  handle.id = handleId;
  handle.style.cssText = `
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 12px;
    cursor: ns-resize;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(96, 96, 96, 0.85);
    border-radius: 6px;
    transition: background 0.2s;
  `;

  const grip = document.createElement("div");
  grip.style.cssText = `
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.9);
  `;
  handle.appendChild(grip);

  handle.addEventListener("mouseenter", () => {
    handle.style.background = "rgba(60, 60, 60, 0.95)";
  });
  handle.addEventListener("mouseleave", () => {
    handle.style.background = "rgba(96, 96, 96, 0.85)";
  });

  handle.addEventListener("mousedown", (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    dragStartY = e.clientY;
    dragStartHeight = currentHeight;
    document.body.style.userSelect = "none";
  });

  return handle;
}

function injectHandle(): void {
  const picker = document.querySelector("yt-emoji-picker-renderer.yt-live-chat-message-input-renderer") as HTMLElement | null;
  if (!picker) return;
  if (document.getElementById(handleId)) return;

  const handle = createHandle();
  picker.style.position = picker.style.position || "relative";
  picker.appendChild(handle);
}

function removeHandle(): void {
  const handle = document.getElementById(handleId);
  if (handle) handle.remove();
}

document.addEventListener("mousemove", (e: MouseEvent) => {
  if (!isDragging) return;
  const delta: number = e.clientY - dragStartY;
  applyHeight(dragStartHeight - delta);
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  document.body.style.userSelect = "";
  chrome.storage.local.set({ emojiHeight: currentHeight });
});

function toggleStyle(enabled: boolean, height: number): void {
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  if (enabled) {
    applyHeight(height);
    injectHandle();
  } else {
    removeHandle();
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
    applyHeight(request.height || 520);
    sendResponse({ success: true });
  }
});

const observer = new MutationObserver(() => {
  if (document.getElementById(styleId)) {
    injectHandle();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
