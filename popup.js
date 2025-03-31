function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action });
  });
}

// Handle display toggle
document.getElementById('displayToggle').addEventListener('change', (e) => {
  sendMessage('toggleDisplay');
});

// Listen for toggle state updates from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateToggleState') {
    document.getElementById('displayToggle').checked = msg.isHidden;
  }
});

// Handle other button clicks
document
  .getElementById('pip')
  .addEventListener('click', () => sendMessage('pip'));
document
  .getElementById('back')
  .addEventListener('click', () => sendMessage('back'));
document
  .getElementById('skip')
  .addEventListener('click', () => sendMessage('skip'));
