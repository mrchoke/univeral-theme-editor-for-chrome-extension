// Popup script for Universal Theme Editor

document.addEventListener('DOMContentLoaded', () => {
  const openEditorBtn = document.getElementById('openEditor')

  openEditorBtn.addEventListener('click', () => {
    // Send message to background script to open options panel
    chrome.runtime.sendMessage({
      action: "openOptionsFromPopup"
    })

    // Close the popup
    window.close()
  })

  // Add some interactive feedback
  openEditorBtn.addEventListener('mouseenter', () => {
    openEditorBtn.style.transform = 'translateY(-2px) scale(1.02)'
  })

  openEditorBtn.addEventListener('mouseleave', () => {
    openEditorBtn.style.transform = 'translateY(0) scale(1)'
  })
})
