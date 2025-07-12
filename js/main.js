console.log('✅ Universal Theme Editor: Content script has loaded!')

/**
 * Initialize extension when DOM is ready
 */
function initializeExtension () {
  // Load debug mode state first
  debugMode = localStorage.getItem('ote-debug-mode') === 'true'

  debugLog('🚀 Initializing Universal Theme Editor...')
  loadState()
  createToggleButton() // Only create the toggle button initially

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

// Check if DOM is already loaded, or wait for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension)
} else {
  // DOM is already loaded
  initializeExtension()
}
