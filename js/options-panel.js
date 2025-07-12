/**
 * Creates and shows the options panel
 */
function showOptionsPanel () {
  console.log('🔧 Creating options panel...')

  // Remove existing panel if any
  const existingPanel = document.getElementById('universal-theme-options-panel')
  if (existingPanel) {
    console.log('⚠️ Removing existing panel')
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
    width: 400px !important;
    max-height: 500px !important;
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
  `

  document.body.appendChild(optionsPanel)
  console.log('✅ Options panel added to DOM')

  // Update statistics
  updateOptionsStats()

  // Add event listeners
  setupOptionsEventListeners()

  // Add hover effects to buttons
  addOptionsPanelHoverEffects(optionsPanel)

  console.log('✅ Options panel setup complete!')
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
      max-height: 400px;
      overflow-y: auto;
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
          <span style="margin-right: 10px; font-size: 16px;">✏️</span> Start Editing (Alt + Click)
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
      Hold <kbd style="background:#fff;color:#333;padding:2px 6px;border-radius:3px;font-weight:bold;">Alt</kbd> 
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
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 1000002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
      overflow: hidden;
    ">
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        text-align: center;
      ">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎨 Universal Dynamic Theme Editor</h2>
        <p style="margin: 0; opacity: 0.9;">Version 1.0</p>
      </div>
      
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #007bff;">✨ Features</h3>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.6;">
          <li>Real-time CSS editing for any websites</li>
          <li>Visual element selection with Alt + Click</li>
          <li>Live preview of style changes</li>
          <li>Export custom CSS for production use</li>
          <li>Persistent storage of your modifications</li>
        </ul>
        
        <h3 style="margin: 0 0 15px 0; color: #007bff;">🚀 How to Use</h3>
        <ol style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.6;">
          <li>Click the 🎨 button to open options</li>
          <li>Select "Start Editing" or hold Alt + Click on any element</li>
          <li>Use the toolbox to modify colors, fonts, spacing, etc.</li>
          <li>Export your changes when ready for production</li>
        </ol>
        
        <div style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-bottom: 20px;
        ">
          <strong>💡 Pro Tip:</strong> You can drag the 🎨 button anywhere on the screen!
        </div>
        
        <div style="text-align: center;">
          <button style="
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          " onclick="this.closest('#ote-about-dialog').remove()">
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
}

/**
 * Sets up event listeners for the options panel
 */
function setupOptionsEventListeners () {
  console.log('🔧 Setting up options event listeners...')

  const panel = document.getElementById('universal-theme-options-panel')
  if (!panel) {
    console.error('❌ Options panel not found!')
    return
  }

  // Close button
  const closeBtn = document.getElementById('ote-options-close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('🔴 Closing options panel')
      panel.remove()
    })
    console.log('✅ Close button listener added')
  } else {
    console.error('❌ Close button not found!')
  }

  // Click outside to close
  document.addEventListener('click', function closeOnOutsideClick (e) {
    if (!panel.contains(e.target)) {
      console.log('🔴 Closing panel - clicked outside')
      panel.remove()
      document.removeEventListener('click', closeOnOutsideClick)
    }
  }, true)

  // Start editing button
  const startEditingBtn = document.getElementById('ote-start-editing-btn')
  if (startEditingBtn) {
    startEditingBtn.addEventListener('click', () => {
      console.log('✏️ Start editing clicked')

      // Initialize full extension if not already done
      if (!document.getElementById('universal-theme-editor-toolbox')) {
        initializeFullExtension()
      }

      panel.remove()
      showInstructions()
    })
    console.log('✅ Start editing button listener added')
  } else {
    console.error('❌ Start editing button not found!')
  }

  // Export all button
  const exportAllBtn = document.getElementById('ote-export-all-btn')
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', () => {
      console.log('📤 Export all clicked')
      exportCss()
      panel.remove()
    })
    console.log('✅ Export all button listener added')
  } else {
    console.error('❌ Export all button not found!')
  }

  // Clear current page button
  const clearCurrentBtn = document.getElementById('ote-clear-current-btn')
  if (clearCurrentBtn) {
    clearCurrentBtn.addEventListener('click', () => {
      console.log('🗑️ Clear current page clicked')
      if (confirm('Clear all styles for the current page? This cannot be undone.')) {
        clearCurrentPageStyles()
        updateOptionsStats()
      }
    })
    console.log('✅ Clear current button listener added')
  } else {
    console.error('❌ Clear current button not found!')
  }

  // Clear all button
  const clearAllBtn = document.getElementById('ote-clear-all-btn')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      console.log('🗑️ Clear all clicked')
      if (confirm('Clear ALL saved styles? This cannot be undone.')) {
        clearAllStyles()
        updateOptionsStats()
      }
    })
    console.log('✅ Clear all button listener added')
  } else {
    console.error('❌ Clear all button not found!')
  }

  // About button
  const aboutBtn = document.getElementById('ote-about-btn')
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      console.log('ℹ️ About clicked')
      showAboutDialog()
    })
    console.log('✅ About button listener added')
  } else {
    console.error('❌ About button not found!')
  }

  console.log('✅ All options event listeners set up!')
}
