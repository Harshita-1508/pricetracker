chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CAPTURE") {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: "png" },
      (dataUrl) => {
        sendResponse({ image: dataUrl });
      }
    );
    return true; // VERY IMPORTANT (keeps async alive)
  }
});
