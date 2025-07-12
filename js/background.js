// Background script for Universal Theme Editor

// Create context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-theme-editor",
    title: "Open Theme Editor",
    contexts: ["page"]
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-theme-editor") {
    // Send message to content script to open options panel
    chrome.tabs.sendMessage(tab.id, {
      action: "openOptionsPanel"
    })
  }
})

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openOptionsFromPopup") {
    // Get the active tab and send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "openOptionsPanel"
        })
      }
    })
  }
})
