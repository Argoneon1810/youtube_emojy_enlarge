const styleId: string = "yt-custom-emoji-resizer-style";
let styleEl: HTMLStyleElement | null = document.getElementById(styleId) as HTMLStyleElement | null;

if (!styleEl) {
  styleEl = document.createElement("style");
  styleEl.id = styleId;
  styleEl.textContent = `
    yt-emoji-picker-renderer.yt-live-chat-message-input-renderer {
        min-height: 520px !important;
        max-height: 880px !important;
        margin: 16px -24px 0 !important;
    }
  `;
}

// 스타일 적용/해제 함수
function toggleStyle(enabled: boolean): void {
  if (enabled) {
    if (!document.getElementById(styleId) && styleEl) {
      document.head.appendChild(styleEl);
    }
  } else {
    const el = document.getElementById(styleId);
    if (el) el.remove();
  }
}

// 저장된 설정 로드 (기본값은 OFF)
chrome.storage.local.get(["emojiExpanded"], (result: { emojiExpanded?: boolean }) => {
  toggleStyle(!!result.emojiExpanded);
});

// 팝업 GUI에서 보내는 토글 신호 대기
chrome.runtime.onMessage.addListener((request: { action?: string; enabled?: boolean }, _sender: chrome.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  if (request.action === "toggleEmoji") {
    toggleStyle(!!request.enabled);
    sendResponse({ success: true });
  }
});
