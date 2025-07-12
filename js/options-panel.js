/**
 * Creates and shows the options panel
 */
function showOptionsPanel () {
  debugLog('🔧 Creating options panel...')

  // Remove existing panel if any
  const existingPanel = document.getElementById('universal-theme-options-panel')
  if (existingPanel) {
    debugLog('⚠️ Removing existing panel')
    existingPanel.remove()
  }

  const optionsPanel = document.createElement('div')
  optionsPanel.id = 'universal-theme-options-panel'
  optionsPanel.innerHTML = getOptionsPanelHTML()

  // Styling for options panel
  optionsPanel.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 600px !important;
    min-width: 400px !important;
    max-width: 90vw !important;
    min-height: 400px !important;
    max-height: 80vh !important;
    background: white !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
    z-index: 1000000 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    color: #333 !important;
    overflow: hidden !important;
    display: block !important;
    visibility: visible !important;
    resize: both !important;
    cursor: auto !important;
  `

  document.body.appendChild(optionsPanel)
  debugLog('✅ Options panel added to DOM')

  // Make the panel draggable
  makePanelDraggable(optionsPanel)

  // Update statistics
  updateOptionsStats()

  // Add event listeners
  setupOptionsEventListeners()

  // Add hover effects to buttons
  addOptionsPanelHoverEffects(optionsPanel)

  debugLog('✅ Options panel setup complete!')
}

/**
 * Returns the HTML template for the options panel
 */
function getOptionsPanelHTML () {
  return `
    <div class="ote-options-header" style="
      padding: 20px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      position: relative;
    ">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🎨 Universal Theme Editor Options</h3>
      <button class="ote-close-btn" id="ote-options-close-btn" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        transition: background-color 0.2s;
      ">&times;</button>
    </div>
    <div class="ote-options-body" style="
      padding: 20px;
      height: calc(100% - 70px);
      overflow-y: auto;
      overflow-x: hidden;
    ">
      <div class="ote-options-section" style="margin-bottom: 25px;">
        <h4 style="
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 6px;
        ">🛠️ Tools</h4>
        <button class="ote-option-btn" id="ote-start-editing-btn" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          text-align: left;
        ">
          <span style="margin-right: 10px; font-size: 16px;">✏️</span> Start Editing (${getModifierKeyName()} + Click)
        </button>
        <button class="ote-option-btn" id="ote-export-all-btn" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          text-align: left;
        ">
          <span style="margin-right: 10px; font-size: 16px;">📤</span> Export All Styles
        </button>
      </div>
      
      <div class="ote-options-section" style="margin-bottom: 25px;">
        <h4 style="
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 6px;
        ">🧹 Clear Data</h4>
        <button class="ote-option-btn ote-danger-btn" id="ote-clear-current-btn" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #dc3545;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          text-align: left;
        ">
          <span style="margin-right: 10px; font-size: 16px;">🗑️</span> Clear Current Page Styles
        </button>
        <button class="ote-option-btn ote-danger-btn" id="ote-clear-all-btn" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #dc3545;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          text-align: left;
        ">
          <span style="margin-right: 10px; font-size: 16px;">🗑️</span> Clear All Saved Styles
        </button>
      </div>
      
      <div class="ote-options-section" style="margin-bottom: 25px;">
        <h4 style="
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 6px;
        ">📊 Statistics</h4>
        <div class="ote-stats" style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        ">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;">
            Saved Selectors: <strong id="ote-stats-selectors" style="color: #007bff; font-weight: 600;">0</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #495057;">
            Total Rules: <strong id="ote-stats-rules" style="color: #007bff; font-weight: 600;">0</strong>
          </p>
        </div>
      </div>
      
      <div class="ote-options-section" style="margin-bottom: 25px;">
        <h4 style="
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 6px;
        ">🐛 Debug Settings</h4>
        <div style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #17a2b8;
        ">
          <label style="
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            cursor: pointer;
            color: #495057;
          ">
            <input type="checkbox" id="ote-debug-mode-checkbox" style="
              margin: 0;
              accent-color: #17a2b8;
            ">
            <span>Enable Debug Mode</span>
          </label>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #6c757d; line-height: 1.4;">
            Shows detailed console logs for debugging purposes. Useful for developers and troubleshooting.
          </p>
        </div>
      </div>
      
      <div class="ote-options-section">
        <h4 style="
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 6px;
        ">ℹ️ Information</h4>
        <button class="ote-option-btn" id="ote-about-btn" style="
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          text-align: left;
        ">
          <span style="margin-right: 10px; font-size: 16px;">ℹ️</span> About This Extension
        </button>
      </div>
    </div>
  `
}

/**
 * Adds hover effects to option panel buttons
 */
function addOptionsPanelHoverEffects (optionsPanel) {
  const buttons = optionsPanel.querySelectorAll('.ote-option-btn')
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (btn.classList.contains('ote-danger-btn')) {
        btn.style.background = '#f5c6cb'
        btn.style.borderColor = '#dc3545'
        btn.style.color = '#721c24'
      } else {
        btn.style.background = '#e9ecef'
        btn.style.borderColor = '#007bff'
        btn.style.color = '#007bff'
      }
      btn.style.transform = 'translateY(-1px)'
    })

    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#f8f9fa'
      btn.style.borderColor = '#e9ecef'
      if (btn.classList.contains('ote-danger-btn')) {
        btn.style.color = '#dc3545'
      } else {
        btn.style.color = '#495057'
      }
      btn.style.transform = 'translateY(0)'
    })
  })
}

/**
 * Updates statistics in the options panel
 */
function updateOptionsStats () {
  const selectorsEl = document.getElementById('ote-stats-selectors')
  const rulesEl = document.getElementById('ote-stats-rules')

  if (selectorsEl) {
    selectorsEl.textContent = Object.keys(cssRules).length
  }

  if (rulesEl) {
    let totalRules = 0
    for (const selector in cssRules) {
      totalRules += Object.keys(cssRules[selector]).length
    }
    rulesEl.textContent = totalRules
  }
}

/**
 * Shows instructions for using the editor
 */
function showInstructions () {
  const instruction = document.createElement('div')
  instruction.id = 'ote-instruction'
  instruction.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 300px;
    ">
      <strong>🎯 Ready to Edit!</strong><br>
      Hold <kbd style="background:#fff;color:#333;padding:2px 6px;border-radius:3px;font-weight:bold;">${getModifierKeyName()}</kbd> 
      and click on any element to start styling it.
      <button style="
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        float: right;
        cursor: pointer;
        margin-top: -5px;
      " onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `
  document.body.appendChild(instruction)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (instruction.parentElement) {
      instruction.remove()
    }
  }, 5000)
}

/**
 * Shows about dialog
 */
function showAboutDialog () {
  const aboutDialog = document.createElement('div')
  aboutDialog.id = 'ote-about-dialog'
  aboutDialog.innerHTML = `
    <div id="ote-about-content" style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 650px;
      min-width: 500px;
      max-width: 90vw;
      min-height: 500px;
      max-height: 90vh;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 1000002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
      overflow: hidden;
      resize: both;
      cursor: auto;
    ">
      <div class="ote-about-header" style="
        padding: 25px;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        text-align: center;
        cursor: move;
        position: relative;
      ">
        <h2 style="margin: 0 0 10px 0; font-size: 28px;">🎨 Universal Dynamic Theme Editor</h2>
        <p style="margin: 0; opacity: 0.9; font-size: 16px;">Version 1.0</p>
        <button class="ote-about-close-btn" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='rgba(255,255,255,0.2)'" onmouseout="this.style.backgroundColor='transparent'" onclick="this.closest('#ote-about-dialog').remove()">&times;</button>
      </div>
      
      <div style="
        padding: 25px;
        height: calc(100% - 120px);
        overflow-y: auto;
        overflow-x: hidden;
        font-size: 15px;
        line-height: 1.6;
      ">
        <h3 style="margin: 0 0 18px 0; color: #007bff; font-size: 20px;">✨ Features</h3>
        <ul style="margin: 0 0 25px 0; padding-left: 25px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Real-time CSS editing for any websites</li>
          <li style="margin-bottom: 8px;">Visual element selection with ${getModifierKeyName()} + Click</li>
          <li style="margin-bottom: 8px;">Live preview of style changes</li>
          <li style="margin-bottom: 8px;">Export custom CSS for production use</li>
          <li style="margin-bottom: 8px;">Persistent storage of your modifications</li>
        </ul>
        
        <h3 style="margin: 0 0 18px 0; color: #007bff; font-size: 20px;">🚀 How to Use</h3>
        <ol style="margin: 0 0 25px 0; padding-left: 25px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Click the 🎨 button to open options</li>
          <li style="margin-bottom: 8px;">Select "Start Editing" or hold ${getModifierKeyName()} + Click on any element</li>
          <li style="margin-bottom: 8px;">Use the toolbox to modify colors, fonts, spacing, etc.</li>
          <li style="margin-bottom: 8px;">Export your changes when ready for production</li>
        </ol>
        
        <div style="
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-bottom: 25px;
          font-size: 15px;
        ">
          <strong>💡 Pro Tip:</strong> You can drag both the 🎨 button and this dialog anywhere on the screen! You can also resize this dialog by dragging from the bottom-right corner.
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button style="
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'" onclick="this.closest('#ote-about-dialog').remove()">
            Got it! 👍
          </button>
        </div>
      </div>
    </div>
  `

  // Add backdrop
  const backdrop = document.createElement('div')
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000001;
  `
  backdrop.addEventListener('click', () => aboutDialog.remove())

  aboutDialog.appendChild(backdrop)
  document.body.appendChild(aboutDialog)

  // Make the about dialog draggable
  const aboutContent = aboutDialog.querySelector('#ote-about-content')
  const aboutHeader = aboutDialog.querySelector('.ote-about-header')
  makeAboutDialogDraggable(aboutContent, aboutHeader)
}

/**
 * Sets up event listeners for the options panel
 */
function setupOptionsEventListeners () {
  debugLog('🔧 Setting up options event listeners...')

  const panel = document.getElementById('universal-theme-options-panel')
  if (!panel) {
    debugError('❌ Options panel not found!')
    return
  }

  // Close button
  const closeBtn = document.getElementById('ote-options-close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      debugLog('🔴 Closing options panel')
      panel.remove()
    })
    debugLog('✅ Close button listener added')
  } else {
    debugError('❌ Close button not found!')
  }

  // Click outside to close (but not when resizing)
  document.addEventListener('click', function closeOnOutsideClick (e) {
    // Don't close if clicking on resize handle or within panel
    if (!panel.contains(e.target) && !e.target.closest('[style*="resize"]')) {
      debugLog('🔴 Closing panel - clicked outside')
      panel.remove()
      document.removeEventListener('click', closeOnOutsideClick)
    }
  }, true)

  // Start editing button
  const startEditingBtn = document.getElementById('ote-start-editing-btn')
  if (startEditingBtn) {
    startEditingBtn.addEventListener('click', () => {
      debugLog('✏️ Start editing clicked')

      // Initialize full extension if not already done
      if (!document.getElementById('universal-theme-editor-toolbox')) {
        initializeFullExtension()
      }

      panel.remove()
      showInstructions()
    })
    debugLog('✅ Start editing button listener added')
  } else {
    debugError('❌ Start editing button not found!')
  }

  // Export all button
  const exportAllBtn = document.getElementById('ote-export-all-btn')
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', () => {
      debugLog('📤 Export all clicked')
      exportCss()
      panel.remove()
    })
    debugLog('✅ Export all button listener added')
  } else {
    debugError('❌ Export all button not found!')
  }

  // Clear current page button
  const clearCurrentBtn = document.getElementById('ote-clear-current-btn')
  if (clearCurrentBtn) {
    clearCurrentBtn.addEventListener('click', () => {
      debugLog('🗑️ Clear current page clicked')
      if (confirm('Clear all styles for the current page? This cannot be undone.')) {
        clearCurrentPageStyles()
        updateOptionsStats()
      }
    })
    debugLog('✅ Clear current button listener added')
  } else {
    debugError('❌ Clear current button not found!')
  }

  // Clear all button
  const clearAllBtn = document.getElementById('ote-clear-all-btn')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      debugLog('🗑️ Clear all clicked')
      if (confirm('Clear ALL saved styles? This cannot be undone.')) {
        clearAllStyles()
        updateOptionsStats()
      }
    })
    debugLog('✅ Clear all button listener added')
  } else {
    debugError('❌ Clear all button not found!')
  }

  // About button
  const aboutBtn = document.getElementById('ote-about-btn')
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      debugLog('ℹ️ About clicked')
      showAboutDialog()
    })
    debugLog('✅ About button listener added')
  } else {
    debugError('❌ About button not found!')
  }

  // Debug mode checkbox
  const debugCheckbox = document.getElementById('ote-debug-mode-checkbox')
  if (debugCheckbox) {
    // Load current debug state from localStorage and update global variable
    const savedDebugMode = localStorage.getItem('ote-debug-mode') === 'true'
    debugMode = savedDebugMode
    debugCheckbox.checked = debugMode

    debugCheckbox.addEventListener('change', (e) => {
      debugMode = e.target.checked
      localStorage.setItem('ote-debug-mode', debugMode.toString())
      debugLog('🐛 Debug mode:', debugMode ? 'ON' : 'OFF')
    })
    debugLog('✅ Debug mode checkbox listener added')
  } else {
    debugError('❌ Debug mode checkbox not found!')
  }

  debugLog('✅ All options event listeners set up!')
}

/**
 * Makes a panel draggable by its header
 */
function makePanelDraggable (panel) {
  const header = panel.querySelector('.ote-options-header')
  if (!header) return

  let isDragging = false
  let dragOffset = { x: 0, y: 0 }

  // Make header draggable
  header.style.cursor = 'move'

  header.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on close button
    if (e.target.closest('.ote-close-btn')) return

    isDragging = true
    const rect = panel.getBoundingClientRect()
    dragOffset.x = e.clientX - rect.left
    dragOffset.y = e.clientY - rect.top

    // Change cursor for body
    document.body.style.cursor = 'move'

    // Prevent text selection
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    e.preventDefault()

    const x = e.clientX - dragOffset.x
    const y = e.clientY - dragOffset.y

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - panel.offsetWidth
    const maxY = window.innerHeight - panel.offsetHeight

    const boundedX = Math.max(0, Math.min(x, maxX))
    const boundedY = Math.max(0, Math.min(y, maxY))

    panel.style.left = boundedX + 'px'
    panel.style.top = boundedY + 'px'
    panel.style.transform = 'none'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      document.body.style.cursor = 'auto'
    }
  })
}

/**
 * Makes the about dialog draggable by its header
 */
function makeAboutDialogDraggable (dialogContent, header) {
  if (!header) return

  let isDragging = false
  let dragOffset = { x: 0, y: 0 }

  header.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on close button
    if (e.target.closest('.ote-about-close-btn')) return

    isDragging = true
    const rect = dialogContent.getBoundingClientRect()
    dragOffset.x = e.clientX - rect.left
    dragOffset.y = e.clientY - rect.top

    // Change cursor for body
    document.body.style.cursor = 'move'

    // Prevent text selection
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    e.preventDefault()

    const x = e.clientX - dragOffset.x
    const y = e.clientY - dragOffset.y

    // Keep dialog within viewport bounds
    const maxX = window.innerWidth - dialogContent.offsetWidth
    const maxY = window.innerHeight - dialogContent.offsetHeight

    const boundedX = Math.max(0, Math.min(x, maxX))
    const boundedY = Math.max(0, Math.min(y, maxY))

    dialogContent.style.left = boundedX + 'px'
    dialogContent.style.top = boundedY + 'px'
    dialogContent.style.transform = 'none'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      document.body.style.cursor = 'auto'
    }
  })
}
