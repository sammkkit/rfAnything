document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startSelect');
  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/selectorMode.js']
      });
      window.close();
    } catch (e) {
      console.error('Failed to start selection mode', e);
      startBtn.disabled = false;
    }
  });
});


