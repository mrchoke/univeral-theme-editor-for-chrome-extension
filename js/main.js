debugLog('✅ Universal Theme Editor: Content script has loaded!')

/**
 * Initialize extension when DOM is ready
 */
function initializeExtension () {
  // Load debug mode state first
  debugMode = localStorage.getItem('ote-debug-mode') === 'true'

  debugLog('🚀 Initializing Universal Theme Editor...')
  loadState()

  // Set up message listener for extension communication
  setupMessageListener()

  // Set up global Alt+Click listener with capture phase
  document.addEventListener('mousedown', handleElementSelection, { capture: true, passive: false })
  document.addEventListener('click', handleElementSelection, { capture: true, passive: false })
  document.addEventListener('auxclick', handleElementSelection, { capture: true, passive: false })

  debugLog('✅ Universal Theme Editor initialized successfully!')
}

/**
 * Initialize full extension when user first interacts
 */
function initializeFullExtension () {
  debugLog('🔧 Initializing full extension features...')
  createToolbox()
  setupEventListeners()
  debugLog('✅ Full extension features initialized!')
}

/**
 * Setup message listener for extension communication
 */
function setupMessageListener () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debugLog('📩 Received message:', request)

    if (request.action === "openOptionsPanel") {
      debugLog('🔧 Opening options panel from message...')

      // Initialize full extension if not already done
      if (!document.getElementById('universal-theme-editor-toolbox')) {
        initializeFullExtension()
      }

      // Show the options panel
      showOptionsPanel()

      sendResponse({ status: "success" })
    }

    return true // Keep the message channel open for async response
  })
}

// Check if DOM is already loaded, or wait for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension)
} else {
  // DOM is already loaded
  initializeExtension()
}
