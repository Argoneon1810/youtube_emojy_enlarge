const toggleBtn = document.getElementById("toggleBtn");

// 초기 UI 상태 로드
chrome.storage.local.get(["emojiExpanded"], (result) => {
  const enabled = !!result.emojiExpanded;
  updateUI(enabled);
});

// 버튼 클릭 이벤트
toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["emojiExpanded"], (result) => {
    const nextState = !result.emojiExpanded;
    
    chrome.storage.local.set({ emojiExpanded: nextState }, () => {
      updateUI(nextState);
      
      // 모든 유튜브 탭 및 아이프레임에 변경 신호 전송
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.includes("youtube.com")) {
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
function updateUI(enabled) {
  if (enabled) {
    toggleBtn.textContent = "확대 모드 (ON)";
    toggleBtn.style.backgroundColor = "#cc0000"; // 유튜브 레드
  } else {
    toggleBtn.textContent = "기본 모드 (OFF)";
    toggleBtn.style.backgroundColor = "#606060"; // 그레이
  }
}