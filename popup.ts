const toggleBtn = document.getElementById("toggleBtn") as HTMLButtonElement;
const heightSlider = document.getElementById("heightSlider") as HTMLInputElement;
const heightValue = document.getElementById("heightValue") as HTMLSpanElement;

// 초기 UI 상태 로드
chrome.storage.local.get(["emojiExpanded", "emojiHeight"], (result: { emojiExpanded?: boolean; emojiHeight?: number }) => {
  const enabled: boolean = !!result.emojiExpanded;
  const height: number = result.emojiHeight || 520;
  updateUI(enabled);
  heightSlider.value = String(height);
  heightValue.textContent = String(height);
});

// 버튼 클릭 이벤트
toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["emojiExpanded"], (result: { emojiExpanded?: boolean }) => {
    const nextState: boolean = !result.emojiExpanded;

    chrome.storage.local.set({ emojiExpanded: nextState }, () => {
      updateUI(nextState);
      broadcastToggle(nextState);
    });
  });
});

// 슬라이더 변경 이벤트
heightSlider.addEventListener("input", () => {
  const height: number = parseInt(heightSlider.value, 10);
  heightValue.textContent = String(height);

  chrome.storage.local.set({ emojiHeight: height }, () => {
    broadcastHeight(height);
  });
});

function broadcastToggle(enabled: boolean): void {
  chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    tabs.forEach((tab: chrome.tabs.Tab) => {
      if (tab.url && tab.url.includes("youtube.com") && tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, { action: "toggleEmoji", enabled }).catch(() => {});
      }
    });
  });
}

function broadcastHeight(height: number): void {
  chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    tabs.forEach((tab: chrome.tabs.Tab) => {
      if (tab.url && tab.url.includes("youtube.com") && tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, { action: "setHeight", height }).catch(() => {});
      }
    });
  });
}

function updateUI(enabled: boolean): void {
  if (enabled) {
    toggleBtn.textContent = "확대 모드 (ON)";
    toggleBtn.style.backgroundColor = "#cc0000";
  } else {
    toggleBtn.textContent = "기본 모드 (OFF)";
    toggleBtn.style.backgroundColor = "#606060";
  }
}
