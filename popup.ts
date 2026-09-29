const toggleBtn = document.getElementById("toggleBtn") as HTMLButtonElement;

// 초기 UI 상태 로드
chrome.storage.local.get(["emojiExpanded"], (result: { emojiExpanded?: boolean }) => {
  const enabled: boolean = !!result.emojiExpanded;
  updateUI(enabled);
});

// 버튼 클릭 이벤트
toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["emojiExpanded"], (result: { emojiExpanded?: boolean }) => {
    const nextState: boolean = !result.emojiExpanded;

    chrome.storage.local.set({ emojiExpanded: nextState }, () => {
      updateUI(nextState);

      // 모든 유튜브 탭 및 아이프레임에 변경 신호 전송
      chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
        tabs.forEach((tab: chrome.tabs.Tab) => {
          if (tab.url && tab.url.includes("youtube.com") && tab.id !== undefined) {
            chrome.tabs.sendMessage(tab.id, { action: "toggleEmoji", enabled: nextState }).catch(() => {
              // 스크립트가 아직 로드되지 않은 탭은 자연스럽게 에러 통과
            });
          }
        });
      });
    });
  });
});

// ON/OFF 스타일에 따른 버튼 UI 변경
function updateUI(enabled: boolean): void {
  if (enabled) {
    toggleBtn.textContent = "확대 모드 (ON)";
    toggleBtn.style.backgroundColor = "#cc0000"; // 유튜브 레드
  } else {
    toggleBtn.textContent = "기본 모드 (OFF)";
    toggleBtn.style.backgroundColor = "#606060"; // 그레이
  }
}
