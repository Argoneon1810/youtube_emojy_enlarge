const styleId = "yt-custom-emoji-resizer-style";
let styleEl = document.getElementById(styleId);

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
function toggleStyle(enabled) {
  if (enabled) {
    if (!document.getElementById(styleId)) {
      document.head.appendChild(styleEl);
    }
  } else {
    const el = document.getElementById(styleId);
    if (el) el.remove();
  }
}

// 저장된 설정 로드 (기본값은 OFF)
chrome.storage.local.get(["emojiExpanded"], (result) => {
  toggleStyle(!!result.emojiExpanded);
});

// 팝업 GUI에서 보내는 토글 신호 대기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleEmoji") {
    toggleStyle(request.enabled);
    sendResponse({ success: true });
  }
});