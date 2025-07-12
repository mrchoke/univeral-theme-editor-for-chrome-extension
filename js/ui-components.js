/**
 * Creates the toggle button for opening options panel
 */
function createToggleButton () {
  // Check if button already exists
  if (document.getElementById('universal-theme-toggle-btn')) {
    return
  }

  const toggleBtn = document.createElement('button')
  toggleBtn.id = 'universal-theme-toggle-btn'
  toggleBtn.innerHTML = '🎨'
  toggleBtn.title = 'Universal Theme Editor Options'
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: grab;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 999998;
    transition: all 0.3s ease;
    user-select: none;
  `

  // Make button draggable
  makeDraggable(toggleBtn)

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    debugLog('🖱️ Toggle button clicked, wasDragged:', toggleBtn.dataset.wasDragged)

    // Only show options if it wasn't dragged
    if (toggleBtn.dataset.wasDragged !== 'true') {
      debugLog('✅ Showing options panel...')

      // Initialize full extension if not already done
      if (!document.getElementById('universal-theme-editor-toolbox')) {
        initializeFullExtension()
      }

      showOptionsPanel()
    } else {
      debugLog('⚠️ Button was dragged, not showing panel')
    }

    // Reset drag state after a delay
    setTimeout(() => {
      toggleBtn.dataset.wasDragged = 'false'
    }, 100)
  })

  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.transform = 'scale(1.1)'
  })

  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.transform = 'scale(1)'
  })

  document.body.appendChild(toggleBtn)
  debugLog('✅ Toggle button created!')
}

/**
 * Creates the toolbox UI and injects it into the page.
 */
function createToolbox () {
  debugLog('🛠️ Creating toolbox...')

  // Check if toolbox already exists
  if (document.getElementById('universal-theme-editor-toolbox')) {
    debugLog('⚠️ Toolbox already exists, skipping creation')
    return
  }

  const toolboxHTML = getToolboxHTML()

  const toolbox = document.createElement('div')
  toolbox.id = 'universal-theme-editor-toolbox'
  toolbox.innerHTML = toolboxHTML
  document.body.appendChild(toolbox)

  debugLog('✅ Toolbox created successfully!')
}

/**
 * Shows the toolbox
 */
function showToolbox () {
  const toolbox = document.getElementById('universal-theme-editor-toolbox')
  if (toolbox) {
    toolbox.style.display = 'block'
    toolbox.style.visibility = 'visible'
  }
}

/**
 * Hides the toolbox
 */
function hideToolbox () {
  const toolbox = document.getElementById('universal-theme-editor-toolbox')
  if (toolbox) {
    toolbox.style.display = 'none'
  }

  // Remove highlight from active element
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
    activeElement = null
  }
}

/**
 * Makes an element draggable
 * @param {HTMLElement} element The element to make draggable
 * @param {string} handle Optional selector for drag handle
 */
function makeDraggable (element, handle = null) {
  const dragHandle = handle ? element.querySelector(handle) : element
  if (!dragHandle) return

  let isDragging = false
  let startX, startY, startLeft, startTop

  dragHandle.addEventListener('mousedown', (e) => {
    isDragging = true
    element.dataset.wasDragged = 'false'

    startX = e.clientX
    startY = e.clientY
    const rect = element.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top

    dragHandle.style.cursor = 'grabbing'
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      element.dataset.wasDragged = 'true'
    }

    element.style.left = (startLeft + deltaX) + 'px'
    element.style.top = (startTop + deltaY) + 'px'
    element.style.position = 'fixed'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      dragHandle.style.cursor = 'grab'
    }
  })
}

/**
 * Returns the HTML template for the toolbox
 */
function getToolboxHTML () {
  return `
        <div class="ote-header">
            <h3>Theme Editor</h3>
            <code class="ote-selector" id="ote-current-selector">No element selected</code>
            <div class="ote-header-buttons">
                <button class="ote-action-btn" id="ote-undo-btn" title="Undo last change">↶</button>
                <button class="ote-close-btn" id="ote-close-btn">&times;</button>
            </div>
        </div>
        <div class="ote-body">
            <div class="ote-control-group">
                <div class="ote-control-row" style="justify-content: space-between; margin-bottom: 10px;">
                    <button class="ote-action-btn" id="ote-reset-btn" title="Reset to original" style="background: #ffc107; color: #212529;">🔄 Reset</button>
                    <label style="display: flex; align-items: center; gap: 5px; font-size: 12px;">
                        <input type="checkbox" id="ote-debug-toggle" style="margin: 0;">
                        Debug Mode
                    </label>
                </div>
            </div>
            
            <div class="ote-control-group" id="ote-element-hierarchy" style="display: none;">
                <label>Element Hierarchy</label>
                <select id="ote-hierarchy-select" style="width: 100%; margin-top: 5px;">
                    <option value="">Select element level...</option>
                </select>
            </div>
            <div class="ote-control-group">
                <label for="ote-color">Text Color</label>
                <div class="ote-control-row">
                    <input type="color" id="ote-color-picker">
                    <input type="text" id="ote-color-text" placeholder="#000000">
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-bg-color">Background Color</label>
                <div class="ote-control-row">
                    <input type="color" id="ote-bg-color-picker">
                    <input type="text" id="ote-bg-color-text" placeholder="#ffffff">
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-font-size">Font Size</label>
                <div class="ote-control-row">
                    <input type="range" id="ote-font-size-slider" min="8" max="72" step="1" class="ote-slider">
                    <input type="text" id="ote-font-size-text" placeholder="16px">
                    <span class="ote-unit">px</span>
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-padding">
                    Padding
                    <button class="ote-expand-btn" id="ote-padding-expand" title="Expand padding controls">⚙️</button>
                </label>
                <div class="ote-control-row">
                    <input type="range" id="ote-padding-slider" min="0" max="100" step="1" class="ote-slider">
                    <input type="text" id="ote-padding-text" placeholder="10px">
                    <span class="ote-unit">px</span>
                </div>
                
                <!-- Expanded padding controls (hidden by default) -->
                <div id="ote-padding-expanded" class="ote-expanded-controls" style="display: none;">
                    <div class="ote-spacing-sides">
                        <h4>Individual Sides</h4>
                        <div class="ote-spacing-side">
                            <label>Top:</label>
                            <input type="range" id="ote-padding-top-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-padding-top-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Right:</label>
                            <input type="range" id="ote-padding-right-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-padding-right-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Bottom:</label>
                            <input type="range" id="ote-padding-bottom-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-padding-bottom-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Left:</label>
                            <input type="range" id="ote-padding-left-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-padding-left-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-margin">
                    Margin
                    <button class="ote-expand-btn" id="ote-margin-expand" title="Expand margin controls">⚙️</button>
                </label>
                <div class="ote-control-row">
                    <input type="range" id="ote-margin-slider" min="0" max="100" step="1" class="ote-slider">
                    <input type="text" id="ote-margin-text" placeholder="0px">
                    <span class="ote-unit">px</span>
                </div>
                
                <!-- Expanded margin controls (hidden by default) -->
                <div id="ote-margin-expanded" class="ote-expanded-controls" style="display: none;">
                    <div class="ote-spacing-sides">
                        <h4>Individual Sides</h4>
                        <div class="ote-spacing-side">
                            <label>Top:</label>
                            <input type="range" id="ote-margin-top-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-margin-top-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Right:</label>
                            <input type="range" id="ote-margin-right-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-margin-right-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Bottom:</label>
                            <input type="range" id="ote-margin-bottom-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-margin-bottom-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                        <div class="ote-spacing-side">
                            <label>Left:</label>
                            <input type="range" id="ote-margin-left-slider" min="0" max="100" step="1" class="ote-slider">
                            <input type="text" id="ote-margin-left-text" placeholder="0px">
                            <span class="ote-unit">px</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-height">Height</label>
                <div class="ote-control-row">
                    <input type="range" id="ote-height-slider" min="10" max="500" step="1" class="ote-slider">
                    <input type="text" id="ote-height-text" placeholder="auto">
                    <select id="ote-height-unit" style="width: 60px;">
                        <option value="px">px</option>
                        <option value="%">%</option>
                        <option value="em">em</option>
                        <option value="rem">rem</option>
                        <option value="vh">vh</option>
                        <option value="auto">auto</option>
                    </select>
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-border">
                    Border
                    <button class="ote-expand-btn" id="ote-border-expand" title="Expand border controls">⚙️</button>
                </label>
                <div class="ote-control-row">
                    <input type="range" id="ote-border-width-slider" min="0" max="20" step="1" class="ote-slider" style="flex: 1;">
                    <input type="text" id="ote-border-width-text" placeholder="1px" style="width: 60px;">
                    <select id="ote-border-style" style="width: 80px;">
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                        <option value="groove">Groove</option>
                        <option value="ridge">Ridge</option>
                        <option value="inset">Inset</option>
                        <option value="outset">Outset</option>
                        <option value="none">None</option>
                    </select>
                    <input type="color" id="ote-border-color-picker">
                </div>
                <div class="ote-control-row">
                    <span style="font-size: 12px; color: #666;">Border Radius:</span>
                    <input type="range" id="ote-border-radius-slider" min="0" max="50" step="1" class="ote-slider">
                    <input type="text" id="ote-border-radius-text" placeholder="0px" style="width: 60px;">
                    <span class="ote-unit">px</span>
                </div>
                
                <!-- Expanded border controls (hidden by default) -->
                <div id="ote-border-expanded" class="ote-expanded-controls" style="display: none;">
                    <div class="ote-border-sides">
                        <h4>Individual Sides</h4>
                        <div class="ote-border-side">
                            <label>Top:</label>
                            <input type="range" id="ote-border-top-width-slider" min="0" max="20" step="1" class="ote-slider">
                            <input type="text" id="ote-border-top-width-text" placeholder="1px">
                            <select id="ote-border-top-style">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="none">None</option>
                            </select>
                            <input type="color" id="ote-border-top-color-picker">
                        </div>
                        <div class="ote-border-side">
                            <label>Right:</label>
                            <input type="range" id="ote-border-right-width-slider" min="0" max="20" step="1" class="ote-slider">
                            <input type="text" id="ote-border-right-width-text" placeholder="1px">
                            <select id="ote-border-right-style">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="none">None</option>
                            </select>
                            <input type="color" id="ote-border-right-color-picker">
                        </div>
                        <div class="ote-border-side">
                            <label>Bottom:</label>
                            <input type="range" id="ote-border-bottom-width-slider" min="0" max="20" step="1" class="ote-slider">
                            <input type="text" id="ote-border-bottom-width-text" placeholder="1px">
                            <select id="ote-border-bottom-style">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="none">None</option>
                            </select>
                            <input type="color" id="ote-border-bottom-color-picker">
                        </div>
                        <div class="ote-border-side">
                            <label>Left:</label>
                            <input type="range" id="ote-border-left-width-slider" min="0" max="20" step="1" class="ote-slider">
                            <input type="text" id="ote-border-left-width-text" placeholder="1px">
                            <select id="ote-border-left-style">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="none">None</option>
                            </select>
                            <input type="color" id="ote-border-left-color-picker">
                        </div>
                    </div>
                    
                    <div class="ote-border-corners">
                        <h4>Individual Corners</h4>
                        <div class="ote-corner-grid">
                            <div class="ote-corner-control">
                                <label>Top-Left:</label>
                                <input type="range" id="ote-border-top-left-radius-slider" min="0" max="50" step="1" class="ote-slider">
                                <input type="text" id="ote-border-top-left-radius-text" placeholder="0px">
                            </div>
                            <div class="ote-corner-control">
                                <label>Top-Right:</label>
                                <input type="range" id="ote-border-top-right-radius-slider" min="0" max="50" step="1" class="ote-slider">
                                <input type="text" id="ote-border-top-right-radius-text" placeholder="0px">
                            </div>
                            <div class="ote-corner-control">
                                <label>Bottom-Left:</label>
                                <input type="range" id="ote-border-bottom-left-radius-slider" min="0" max="50" step="1" class="ote-slider">
                                <input type="text" id="ote-border-bottom-left-radius-text" placeholder="0px">
                            </div>
                            <div class="ote-corner-control">
                                <label>Bottom-Right:</label>
                                <input type="range" id="ote-border-bottom-right-radius-slider" min="0" max="50" step="1" class="ote-slider">
                                <input type="text" id="ote-border-bottom-right-radius-text" placeholder="0px">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ote-footer">
            <button class="ote-export-btn" id="ote-export-btn">Export CSS</button>
        </div>
    `
}
