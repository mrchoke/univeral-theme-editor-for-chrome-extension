console.log('✅ OJS Theme Editor: Content script has loaded!')

// == GLOBALS & STATE ==
let activeElement = null
let cssRules = {} // Stores all the custom CSS rules. e.g. { ".selector": { "color": "#ff0000" } }
let originalValues = {} // Stores original values for undo
let currentHistory = {} // Stores current session changes for reset
const HIGHLIGHT_CLASS = 'ojs-editor-highlight'

// == INITIALIZATION ==
function initializeExtension () {
  console.log('🚀 Initializing OJS Theme Editor...')
  loadState()
  createToggleButton() // Only create the toggle button initially

  // Set up global Alt+Click listener
  document.addEventListener('mousedown', handleElementSelection, true)

  console.log('✅ OJS Theme Editor initialized successfully!')
}

/**
 * Initialize full extension when user first interacts
 */
function initializeFullExtension () {
  console.log('🔧 Initializing full extension features...')
  createToolbox()
  setupEventListeners()
  console.log('✅ Full extension features initialized!')
}

/**
 * Sets up event listeners for toolbox functionality only
 */
function setupEventListeners () {
  console.log('🔧 Setting up toolbox event listeners...')

  // Toolbox functionality
  const toolbox = document.getElementById('ojs-theme-editor-toolbox')
  if (!toolbox) {
    console.error('❌ Toolbox not found!')
    return
  }

  toolbox.addEventListener('click', e => e.stopPropagation()) // Prevent clicks inside the toolbox from bubbling up

  const closeBtn = document.getElementById('ote-close-btn')
  const exportBtn = document.getElementById('ote-export-btn')
  const undoBtn = document.getElementById('ote-undo-btn')
  const resetBtn = document.getElementById('ote-reset-btn')

  if (closeBtn) closeBtn.addEventListener('click', hideToolbox)
  if (exportBtn) exportBtn.addEventListener('click', exportCss)
  if (undoBtn) undoBtn.addEventListener('click', undoLastChange)
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (activeElement && confirm('Reset this element to its original values?')) {
      resetToOriginal(activeElement)
    }
  })

  // Border expand button
  const borderExpandBtn = document.getElementById('ote-border-expand')
  if (borderExpandBtn) {
    borderExpandBtn.addEventListener('click', toggleBorderExpand)
  }

  // Listen for changes in all input fields
  setupInputEventListeners()

  // Make toolbox draggable
  makeDraggable(toolbox, '.ote-header')

  console.log('✅ Toolbox event listeners set up successfully!')
}

/**
 * Sets up event listeners for all input controls
 */
function setupInputEventListeners () {
  // Basic controls with sliders
  const basicControls = [
    { prop: 'color', hasSlider: false },
    { prop: 'background-color', hasSlider: false },
    { prop: 'font-size', hasSlider: true, unit: 'px' },
    { prop: 'padding', hasSlider: true, unit: 'px' },
    { prop: 'margin', hasSlider: true, unit: 'px' }
  ]

  basicControls.forEach(control => {
    const textInput = document.getElementById(`ote-${control.prop.replace('-color', '')}-text`)
    const colorInput = document.getElementById(`ote-${control.prop}-picker`)
    const sliderInput = document.getElementById(`ote-${control.prop.replace('-color', '')}-slider`)

    if (textInput) {
      textInput.addEventListener('input', (e) => {
        applyStyle(control.prop, e.target.value)
        if (sliderInput && control.hasSlider) {
          sliderInput.value = extractNumericValue(e.target.value)
        }
      })
    }

    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        applyStyle(control.prop, e.target.value)
        if (textInput) textInput.value = e.target.value
      })
    }

    if (sliderInput && control.hasSlider) {
      sliderInput.addEventListener('input', (e) => {
        const value = e.target.value + (control.unit || 'px')
        applyStyle(control.prop, value)
        if (textInput) textInput.value = value
      })
    }
  })

  // Border controls
  setupBorderEventListeners()
}

/**
 * Sets up event listeners for border controls
 */
function setupBorderEventListeners () {
  // Main border controls
  const borderWidthSlider = document.getElementById('ote-border-width-slider')
  const borderWidthText = document.getElementById('ote-border-width-text')
  const borderStyle = document.getElementById('ote-border-style')
  const borderColorPicker = document.getElementById('ote-border-color-picker')
  const borderRadiusSlider = document.getElementById('ote-border-radius-slider')
  const borderRadiusText = document.getElementById('ote-border-radius-text')

  if (borderWidthSlider) {
    borderWidthSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      const style = borderStyle.value || 'solid'
      const color = borderColorPicker.value || '#000000'
      const borderValue = `${value} ${style} ${color}`
      applyStyle('border', borderValue)
      if (borderWidthText) borderWidthText.value = value
    })
  }

  if (borderWidthText) {
    borderWidthText.addEventListener('input', (e) => {
      const value = e.target.value
      const style = borderStyle.value || 'solid'
      const color = borderColorPicker.value || '#000000'
      const borderValue = `${value} ${style} ${color}`
      applyStyle('border', borderValue)
      if (borderWidthSlider) borderWidthSlider.value = extractNumericValue(value)
    })
  }

  if (borderStyle) {
    borderStyle.addEventListener('change', (e) => {
      const width = borderWidthText.value || '1px'
      const style = e.target.value
      const color = borderColorPicker.value || '#000000'
      const borderValue = `${width} ${style} ${color}`
      applyStyle('border', borderValue)
    })
  }

  if (borderColorPicker) {
    borderColorPicker.addEventListener('input', (e) => {
      const width = borderWidthText.value || '1px'
      const style = borderStyle.value || 'solid'
      const color = e.target.value
      const borderValue = `${width} ${style} ${color}`
      applyStyle('border', borderValue)
    })
  }

  if (borderRadiusSlider) {
    borderRadiusSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      applyStyle('border-radius', value)
      if (borderRadiusText) borderRadiusText.value = value
    })
  }

  if (borderRadiusText) {
    borderRadiusText.addEventListener('input', (e) => {
      applyStyle('border-radius', e.target.value)
      if (borderRadiusSlider) borderRadiusSlider.value = extractNumericValue(e.target.value)
    })
  }

  // Individual border side controls
  const sides = ['top', 'right', 'bottom', 'left']
  sides.forEach(side => {
    setupIndividualBorderSide(side)
  })

  // Individual corner controls
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  corners.forEach(corner => {
    setupIndividualBorderCorner(corner)
  })
}

/**
 * Sets up event listeners for individual border sides
 */
function setupIndividualBorderSide (side) {
  const widthSlider = document.getElementById(`ote-border-${side}-width-slider`)
  const widthText = document.getElementById(`ote-border-${side}-width-text`)
  const styleSelect = document.getElementById(`ote-border-${side}-style`)
  const colorPicker = document.getElementById(`ote-border-${side}-color-picker`)

  const updateBorderSide = () => {
    const width = widthText?.value || '1px'
    const style = styleSelect?.value || 'solid'
    const color = colorPicker?.value || '#000000'
    const borderValue = `${width} ${style} ${color}`
    applyStyle(`border-${side}`, borderValue)
  }

  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      if (widthText) widthText.value = value
      updateBorderSide()
    })
  }

  if (widthText) {
    widthText.addEventListener('input', (e) => {
      if (widthSlider) widthSlider.value = extractNumericValue(e.target.value)
      updateBorderSide()
    })
  }

  if (styleSelect) {
    styleSelect.addEventListener('change', updateBorderSide)
  }

  if (colorPicker) {
    colorPicker.addEventListener('input', updateBorderSide)
  }
}

/**
 * Sets up event listeners for individual border corners
 */
function setupIndividualBorderCorner (corner) {
  const radiusSlider = document.getElementById(`ote-border-${corner}-radius-slider`)
  const radiusText = document.getElementById(`ote-border-${corner}-radius-text`)

  if (radiusSlider) {
    radiusSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      applyStyle(`border-${corner}-radius`, value)
      if (radiusText) radiusText.value = value
    })
  }

  if (radiusText) {
    radiusText.addEventListener('input', (e) => {
      applyStyle(`border-${corner}-radius`, e.target.value)
      if (radiusSlider) radiusSlider.value = extractNumericValue(e.target.value)
    })
  }
}

/**
 * Toggles the expanded border controls
 */
function toggleBorderExpand () {
  const expandedControls = document.getElementById('ote-border-expanded')
  const expandBtn = document.getElementById('ote-border-expand')

  if (expandedControls && expandBtn) {
    const isExpanded = expandedControls.style.display !== 'none'
    expandedControls.style.display = isExpanded ? 'none' : 'block'
    expandBtn.textContent = isExpanded ? '⚙️' : '📐'
    expandBtn.title = isExpanded ? 'Expand border controls' : 'Collapse border controls'
  }
}

/**
 * Creates a toggle button for easy access to the toolbox
 */
function createToggleButton () {
  // Check if button already exists
  if (document.getElementById('ojs-theme-toggle-btn')) {
    return
  }

  const toggleBtn = document.createElement('button')
  toggleBtn.id = 'ojs-theme-toggle-btn'
  toggleBtn.innerHTML = '🎨'
  toggleBtn.title = 'OJS Theme Editor Options'
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

    console.log('🖱️ Toggle button clicked, wasDragged:', toggleBtn.dataset.wasDragged)

    // Only show options if it wasn't dragged
    if (toggleBtn.dataset.wasDragged !== 'true') {
      console.log('✅ Showing options panel...')

      // Initialize full extension if not already done
      if (!document.getElementById('ojs-theme-editor-toolbox')) {
        initializeFullExtension()
      }

      showOptionsPanel()
    } else {
      console.log('⚠️ Button was dragged, not showing panel')
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
  console.log('✅ Toggle button created!')
}

// Check if DOM is already loaded, or wait for it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension)
} else {
  // DOM is already loaded
  initializeExtension()
}

// == CORE FUNCTIONS ==

/**
 * Creates the toolbox UI and injects it into the page.
 */
function createToolbox () {
  console.log('🛠️ Creating toolbox...')

  // Check if toolbox already exists
  if (document.getElementById('ojs-theme-editor-toolbox')) {
    console.log('⚠️ Toolbox already exists, skipping creation')
    return
  }

  const toolboxHTML = `
        <div class="ote-header">
            <h3>Theme Editor</h3>
            <code class="ote-selector" id="ote-current-selector">No element selected</code>
            <div class="ote-header-buttons">
                <button class="ote-action-btn" id="ote-undo-btn" title="Undo last change">↶</button>
                <button class="ote-action-btn" id="ote-reset-btn" title="Reset to original">🔄</button>
                <button class="ote-close-btn" id="ote-close-btn">&times;</button>
            </div>
        </div>
        <div class="ote-body">
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
                <label for="ote-padding">Padding</label>
                <div class="ote-control-row">
                    <input type="range" id="ote-padding-slider" min="0" max="100" step="1" class="ote-slider">
                    <input type="text" id="ote-padding-text" placeholder="10px">
                    <span class="ote-unit">px</span>
                </div>
            </div>
            
            <div class="ote-control-group">
                <label for="ote-margin">Margin</label>
                <div class="ote-control-row">
                    <input type="range" id="ote-margin-slider" min="0" max="100" step="1" class="ote-slider">
                    <input type="text" id="ote-margin-text" placeholder="0px">
                    <span class="ote-unit">px</span>
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
  const toolbox = document.createElement('div')
  toolbox.id = 'ojs-theme-editor-toolbox'
  toolbox.innerHTML = toolboxHTML
  document.body.appendChild(toolbox)

  console.log('✅ Toolbox created successfully!')
}

/**
 * Handles the selection of an element on the page.
 * @param {MouseEvent} e The mousedown event.
 */
function handleElementSelection (e) {
  if (!e.altKey) return // Only activate on Alt key press

  console.log('🖱️ Element selection triggered with Alt key:', e.target)

  // Initialize full extension if not already done
  if (!document.getElementById('ojs-theme-editor-toolbox')) {
    console.log('🔧 Initializing full extension for Alt+Click...')
    initializeFullExtension()
  }

  e.preventDefault()
  e.stopPropagation()

  const target = e.target

  // Don't select the toolbox, toggle button, options panel, or their children
  if (target.closest('#ojs-theme-editor-toolbox') ||
    target.closest('#ojs-theme-toggle-btn') ||
    target.closest('#ojs-theme-options-panel') ||
    target.closest('#ote-about-dialog') ||
    target.closest('#ote-instruction')) {
    console.log('⚠️ Clicked on extension UI, ignoring...')
    return
  }

  // Remove highlight from the previously selected element
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
  }

  // Set new active element and highlight it
  activeElement = target
  activeElement.classList.add(HIGHLIGHT_CLASS)

  // Store original values for undo functionality
  storeOriginalValues(activeElement)

  // Update and show the toolbox
  const selector = generateSelector(activeElement)
  console.log('✅ Selected element with selector:', selector)

  const selectorElement = document.getElementById('ote-current-selector')
  if (selectorElement) selectorElement.textContent = selector

  // Populate toolbox with current element values
  populateToolbox(activeElement)
  showToolbox()
}

/**
 * Generates a CSS selector for a given element.
 * @param {HTMLElement} el The element to generate a selector for.
 * @returns {string} The generated CSS selector.
 */
function generateSelector (el) {
  if (!el) return ''
  if (el.id) {
    return `#${el.id}`
  }

  let parts = []
  let currentEl = el
  while (currentEl.parentElement && currentEl.tagName.toLowerCase() !== 'body') {
    let part = currentEl.tagName.toLowerCase()
    const classes = Array.from(currentEl.classList).filter(c => !c.startsWith('ojs-') && c !== 'hover' && c !== 'focus')
    if (classes.length > 0) {
      // Prioritize classes with 'pkp', 'cmp', 'obj' for OJS context
      const ojsClass = classes.find(c => c.includes('pkp') || c.includes('cmp') || c.includes('obj'))
      if (ojsClass) {
        part += `.${ojsClass}`
      } else {
        part += `.${classes[0]}`
      }
    }

    parts.unshift(part)

    // Stop if we find a parent with an ID
    if (currentEl.parentElement.id) {
      parts.unshift(`#${currentEl.parentElement.id}`)
      break
    }

    // Stop after a few levels to avoid overly specific selectors
    if (parts.length >= 3) break

    currentEl = currentEl.parentElement
  }
  return parts.join(' > ')
}

/**
 * Applies a CSS style to the active element and updates the state.
 * @param {string} property The CSS property to change.
 * @param {string} value The new value for the property.
 */
function applyStyle (property, value) {
  if (!activeElement) {
    console.warn('⚠️ No active element selected')
    return
  }

  console.log(`🎨 Applying style: ${property} = ${value}`)

  // Update the CSS rules state
  const selector = generateSelector(activeElement)
  if (!cssRules[selector]) {
    cssRules[selector] = {}
  }
  cssRules[selector][property] = value

  // Store in current history for undo
  if (!currentHistory[selector]) {
    currentHistory[selector] = {}
  }
  currentHistory[selector][property] = value

  // Apply styles to ALL elements with this selector (realtime)
  applyAllRules()

  // Update the corresponding input fields (avoid infinite loops)
  updateInputFields(property, value)

  saveState()
}

/**
 * Updates input fields to match applied values
 * @param {string} property The CSS property
 * @param {string} value The CSS value
 */
function updateInputFields (property, value) {
  const textInputId = `ote-${property.replace('-color', '')}-text`
  const colorInputId = `ote-${property}-picker`
  const sliderInputId = `ote-${property}-slider`

  const textInput = document.getElementById(textInputId)
  const colorInput = document.getElementById(colorInputId)
  const sliderInput = document.getElementById(sliderInputId)

  if (textInput && textInput.value !== value) textInput.value = value
  if (colorInput && colorInput.value !== value) colorInput.value = value
  if (sliderInput && sliderInput.value !== extractNumericValue(value)) {
    sliderInput.value = extractNumericValue(value)
  }
}

/**
 * Populates the toolbox inputs with the current styles of the selected element.
 * @param {HTMLElement} el The selected element.
 */
function populateToolbox (el) {
  console.log('📝 Populating toolbox for new element...')

  // Clear all input fields first to avoid showing old values
  clearAllInputs()

  const computedStyle = getComputedStyle(el)
  const isImage = isImageElement(el)

  // Get actual computed values
  const color = computedStyle.getPropertyValue('color')
  const backgroundColor = computedStyle.getPropertyValue('background-color')
  const fontSize = computedStyle.getPropertyValue('font-size')
  const padding = computedStyle.getPropertyValue('padding')
  const margin = computedStyle.getPropertyValue('margin')
  const border = computedStyle.getPropertyValue('border')
  const borderRadius = computedStyle.getPropertyValue('border-radius')
  const boxShadow = computedStyle.getPropertyValue('box-shadow')
  const width = computedStyle.getPropertyValue('width')
  const height = computedStyle.getPropertyValue('height')

  console.log('📝 Current element values:', {
    color, backgroundColor, fontSize, padding, margin, border, borderRadius, boxShadow, width, height, isImage
  })

  // Show/hide controls based on element type
  toggleControlsVisibility(isImage)

  // Populate basic controls
  populateColorInput('color', color)
  populateBackgroundInput(backgroundColor)
  populateValueInput('font-size', fontSize)
  populateValueInput('padding', padding)
  populateValueInput('margin', margin)

  // Populate border controls
  populateBorderControls(el, computedStyle)

  // Populate shadow controls
  populateShadowControls(boxShadow)

  // Populate dimension controls for images
  if (isImage) {
    populateDimensionControls(width, height)
  }
}

/**
 * Clears all input fields in the toolbox
 */
function clearAllInputs () {
  const inputs = document.querySelectorAll('#ojs-theme-editor-toolbox input, #ojs-theme-editor-toolbox select')
  inputs.forEach(input => {
    if (input.type === 'color') {
      input.value = '#000000'
    } else if (input.type === 'range') {
      input.value = input.min || 0
    } else if (input.type === 'checkbox') {
      input.checked = false
    } else {
      input.value = ''
    }
  })
}

/**
 * Shows/hides controls based on element type
 * @param {boolean} isImage Whether the element is an image
 */
function toggleControlsVisibility (isImage) {
  // Get control groups
  const fontSizeGroup = document.querySelector('[for="ote-font-size"]')?.closest('.ote-control-group')
  const dimensionGroup = document.getElementById('ote-dimension-group')

  if (fontSizeGroup) {
    fontSizeGroup.style.display = isImage ? 'none' : 'block'
  }

  if (dimensionGroup) {
    dimensionGroup.style.display = isImage ? 'block' : 'none'
  }
}

/**
 * Populates color input fields
 */
function populateColorInput (property, value) {
  const textInput = document.getElementById(`ote-${property.replace('-color', '')}-text`)
  const colorInput = document.getElementById(`ote-${property}-picker`)

  if (textInput) {
    textInput.value = value
    console.log(`📝 Set ${property} text input to:`, value)
  }

  if (colorInput && value) {
    try {
      if (value.startsWith('rgb')) {
        // Convert RGB to hex for color picker
        const rgb = value.match(/\d+/g)
        if (rgb && rgb.length >= 3) {
          const hex = '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
          colorInput.value = hex
          console.log(`🎨 Set ${property} color picker to:`, hex)
        }
      } else if (value.startsWith('#')) {
        colorInput.value = value
        console.log(`🎨 Set ${property} color picker to:`, value)
      }
    } catch (e) {
      console.warn('Could not set color picker value:', e)
    }
  }
}

/**
 * Populates value input fields (with sliders)
 */
function populateValueInput (property, value) {
  const textInput = document.getElementById(`ote-${property}-text`)
  const sliderInput = document.getElementById(`ote-${property}-slider`)

  if (textInput) {
    textInput.value = value
    console.log(`📝 Set ${property} text input to:`, value)
  }

  if (sliderInput) {
    const numericValue = extractNumericValue(value)
    sliderInput.value = numericValue
    console.log(`🎚️ Set ${property} slider to:`, numericValue)
  }
}

/**
 * Populates border control fields
 */
function populateBorderControls (el, computedStyle) {
  // Main border controls
  const borderWidth = computedStyle.getPropertyValue('border-width') || '0px'
  const borderStyle = computedStyle.getPropertyValue('border-style') || 'solid'
  const borderColor = computedStyle.getPropertyValue('border-color') || '#000000'
  const borderRadius = computedStyle.getPropertyValue('border-radius') || '0px'

  // Border width
  const borderWidthText = document.getElementById('ote-border-width-text')
  const borderWidthSlider = document.getElementById('ote-border-width-slider')
  if (borderWidthText) borderWidthText.value = borderWidth.split(' ')[0] || '0px'
  if (borderWidthSlider) borderWidthSlider.value = extractNumericValue(borderWidth)

  // Border style
  const borderStyleSelect = document.getElementById('ote-border-style')
  if (borderStyleSelect) {
    const styleValue = borderStyle.split(' ')[0] || 'solid'
    borderStyleSelect.value = styleValue
  }

  // Border color
  const borderColorPicker = document.getElementById('ote-border-color-picker')
  if (borderColorPicker) {
    try {
      const colorValue = borderColor.split(' ')[0] || '#000000'
      if (colorValue.startsWith('rgb')) {
        const rgb = colorValue.match(/\d+/g)
        if (rgb && rgb.length >= 3) {
          const hex = '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
          borderColorPicker.value = hex
        }
      } else if (colorValue.startsWith('#')) {
        borderColorPicker.value = colorValue
      }
    } catch (e) {
      console.warn('Could not set border color:', e)
    }
  }

  // Border radius
  const borderRadiusText = document.getElementById('ote-border-radius-text')
  const borderRadiusSlider = document.getElementById('ote-border-radius-slider')
  if (borderRadiusText) borderRadiusText.value = borderRadius.split(' ')[0] || '0px'
  if (borderRadiusSlider) borderRadiusSlider.value = extractNumericValue(borderRadius)

  // Individual border sides and corners
  populateIndividualBorderControls(computedStyle)
}

/**
 * Populates individual border side and corner controls
 */
function populateIndividualBorderControls (computedStyle) {
  const sides = ['top', 'right', 'bottom', 'left']
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

  // Populate individual sides
  sides.forEach(side => {
    const width = computedStyle.getPropertyValue(`border-${side}-width`) || '0px'
    const style = computedStyle.getPropertyValue(`border-${side}-style`) || 'solid'
    const color = computedStyle.getPropertyValue(`border-${side}-color`) || '#000000'

    const widthText = document.getElementById(`ote-border-${side}-width-text`)
    const widthSlider = document.getElementById(`ote-border-${side}-width-slider`)
    const styleSelect = document.getElementById(`ote-border-${side}-style`)
    const colorPicker = document.getElementById(`ote-border-${side}-color-picker`)

    if (widthText) widthText.value = width
    if (widthSlider) widthSlider.value = extractNumericValue(width)
    if (styleSelect) styleSelect.value = style
    if (colorPicker) {
      try {
        if (color.startsWith('rgb')) {
          const rgb = color.match(/\d+/g)
          if (rgb && rgb.length >= 3) {
            const hex = '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
            colorPicker.value = hex
          }
        } else if (color.startsWith('#')) {
          colorPicker.value = color
        }
      } catch (e) {
        console.warn(`Could not set border-${side}-color:`, e)
      }
    }
  })

  // Populate individual corners
  corners.forEach(corner => {
    const radius = computedStyle.getPropertyValue(`border-${corner}-radius`) || '0px'

    const radiusText = document.getElementById(`ote-border-${corner}-radius-text`)
    const radiusSlider = document.getElementById(`ote-border-${corner}-radius-slider`)

    if (radiusText) radiusText.value = radius
    if (radiusSlider) radiusSlider.value = extractNumericValue(radius)
  })
}

/**
 * Exports the collected CSS rules as a .css file.
 */
function exportCss () {
  let cssString = '/* --- Custom OJS Theme Styles --- */\n\n'
  for (const selector in cssRules) {
    cssString += `${selector} {\n`
    for (const property in cssRules[selector]) {
      const value = cssRules[selector][property]
      cssString += `    ${property}: ${value} !important;\n`
    }
    cssString += '}\n\n'
  }

  const blob = new Blob([cssString], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'custom-ojs-theme.css'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Creates and shows the options panel
 */
function showOptionsPanel () {
  console.log('🔧 Creating options panel...')

  // Remove existing panel if any
  const existingPanel = document.getElementById('ojs-theme-options-panel')
  if (existingPanel) {
    console.log('⚠️ Removing existing panel')
    existingPanel.remove()
  }

  const optionsPanel = document.createElement('div')
  optionsPanel.id = 'ojs-theme-options-panel'
  optionsPanel.innerHTML = `
    <div class="ote-options-header" style="
      padding: 20px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      position: relative;
    ">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🎨 OJS Theme Editor Options</h3>
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

  console.log('✅ Options panel setup complete!')
}

/**
 * Sets up event listeners for the options panel
 */
function setupOptionsEventListeners () {
  console.log('🔧 Setting up options event listeners...')

  const panel = document.getElementById('ojs-theme-options-panel')
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
      if (!document.getElementById('ojs-theme-editor-toolbox')) {
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
 * Clears styles for current page only
 */
function clearCurrentPageStyles () {
  const currentDomain = window.location.hostname
  const selectorsToRemove = []

  for (const selector in cssRules) {
    // Remove styles that exist on current page
    try {
      if (document.querySelector(selector)) {
        selectorsToRemove.push(selector)
      }
    } catch (e) {
      // Invalid selector, remove it anyway
      selectorsToRemove.push(selector)
    }
  }

  selectorsToRemove.forEach(selector => {
    delete cssRules[selector]
  })

  // Remove applied styles
  const styleSheet = document.getElementById('ojs-dynamic-styles')
  if (styleSheet) {
    styleSheet.remove()
  }

  // Remove highlights
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
    activeElement = null
  }

  saveState()
  console.log(`🧹 Cleared ${selectorsToRemove.length} styles for current page`)
}

/**
 * Clears all saved styles
 */
function clearAllStyles () {
  cssRules = {}

  // Remove applied styles
  const styleSheet = document.getElementById('ojs-dynamic-styles')
  if (styleSheet) {
    styleSheet.remove()
  }

  // Remove highlights
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
    activeElement = null
  }

  // Hide toolbox
  const toolbox = document.getElementById('ojs-theme-editor-toolbox')
  if (toolbox) {
    toolbox.classList.remove('visible')
  }

  saveState()
  console.log('🧹 Cleared all saved styles')
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
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎨 OJS3 Dynamic Theme Editor</h2>
        <p style="margin: 0; opacity: 0.9;">Version 1.0</p>
      </div>
      
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #007bff;">✨ Features</h3>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.6;">
          <li>Real-time CSS editing for OJS3 websites</li>
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

// == HELPER FUNCTIONS ==

/**
 * Stores original values of an element for undo functionality
 * @param {HTMLElement} element The element to store values for
 */
function storeOriginalValues (element) {
  if (!element) return

  const selector = generateSelector(element)
  const computedStyle = getComputedStyle(element)

  originalValues[selector] = {
    color: computedStyle.getPropertyValue('color'),
    backgroundColor: computedStyle.getPropertyValue('background-color'),
    fontSize: computedStyle.getPropertyValue('font-size'),
    padding: computedStyle.getPropertyValue('padding'),
    margin: computedStyle.getPropertyValue('margin'),
    border: computedStyle.getPropertyValue('border'),
    borderRadius: computedStyle.getPropertyValue('border-radius'),
    boxShadow: computedStyle.getPropertyValue('box-shadow'),
    width: computedStyle.getPropertyValue('width'),
    height: computedStyle.getPropertyValue('height')
  }

  // Clear current history when selecting new element
  currentHistory[selector] = {}

  console.log('📝 Stored original values for:', selector, originalValues[selector])
}

/**
 * Resets element to its original values
 * @param {HTMLElement} element The element to reset
 */
function resetToOriginal (element) {
  if (!element) return

  const selector = generateSelector(element)
  const original = originalValues[selector]

  if (!original) {
    console.warn('⚠️ No original values found for element')
    return
  }

  // Remove all custom styles for this selector
  if (cssRules[selector]) {
    delete cssRules[selector]
  }

  // Clear current history
  currentHistory[selector] = {}

  // Reapply all rules (which now excludes this element)
  applyAllRules()

  // Repopulate toolbox with original values
  populateToolbox(element)

  saveState()
  console.log('🔄 Reset element to original values:', selector)
}

/**
 * Undoes the last change for current element
 */
function undoLastChange () {
  if (!activeElement) return

  const selector = generateSelector(activeElement)
  const history = currentHistory[selector]

  if (!history || Object.keys(history).length === 0) {
    console.warn('⚠️ No changes to undo')
    return
  }

  // Get the last changed property
  const lastProperty = Object.keys(history).pop()
  if (lastProperty) {
    delete history[lastProperty]
    if (cssRules[selector]) {
      delete cssRules[selector][lastProperty]

      // If no more properties, remove the selector entirely
      if (Object.keys(cssRules[selector]).length === 0) {
        delete cssRules[selector]
      }
    }
  }

  applyAllRules()
  populateToolbox(activeElement)
  saveState()

  console.log('↶ Undid last change for:', selector, lastProperty)
}

/**
 * Detects if element is an image
 * @param {HTMLElement} element The element to check
 * @returns {boolean} True if element is an image
 */
function isImageElement (element) {
  return element.tagName.toLowerCase() === 'img' ||
    (element.tagName.toLowerCase() === 'div' &&
      getComputedStyle(element).backgroundImage !== 'none')
}

/**
 * Extracts numeric value from a CSS value string
 * @param {string} value The CSS value
 * @returns {number} The numeric value
 */
function extractNumericValue (value) {
  if (!value) return 0
  const match = value.toString().match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 0
}

/**
 * Converts RGB to Hex
 * @param {string} rgb RGB color string
 * @returns {string} Hex color string
 */
function rgbToHex (rgb) {
  if (!rgb || !rgb.startsWith('rgb')) return rgb

  const match = rgb.match(/\d+/g)
  if (match && match.length >= 3) {
    return '#' + match.slice(0, 3).map(x =>
      parseInt(x).toString(16).padStart(2, '0')
    ).join('')
  }
  return rgb
}

// == UI & STATE HELPERS ==

function showToolbox () {
  document.getElementById('ojs-theme-editor-toolbox').classList.add('visible')
}

function hideToolbox () {
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
    activeElement = null
  }
  document.getElementById('ojs-theme-editor-toolbox').classList.remove('visible')
}

function saveState () {
  chrome.storage.local.set({ ojsThemeEditorRules: cssRules })
}

function loadState () {
  chrome.storage.local.get('ojsThemeEditorRules', (result) => {
    if (result.ojsThemeEditorRules) {
      cssRules = result.ojsThemeEditorRules
      // Optionally, apply saved styles on load
      applyAllRules()
    }
  })
}

function applyAllRules () {
  let styleSheet = document.getElementById('ojs-dynamic-styles')
  if (!styleSheet) {
    styleSheet = document.createElement('style')
    styleSheet.id = 'ojs-dynamic-styles'
    document.head.appendChild(styleSheet)
  }

  let cssString = ''
  for (const selector in cssRules) {
    try {
      if (document.querySelector(selector)) {
        cssString += `${selector} {`
        for (const property in cssRules[selector]) {
          const value = cssRules[selector][property]
          cssString += `${property}: ${value} !important;`
        }
        cssString += `}`
      }
    } catch (e) {
      console.warn("Invalid selector in stored rules:", selector)
    }
  }
  styleSheet.innerHTML = cssString
}

function makeDraggable (element, handle) {
  let isDragging = false
  let dragStarted = false
  let startX = 0, startY = 0
  let initialX = 0, initialY = 0
  const dragHandle = handle ? element.querySelector(handle) : element

  if (dragHandle) {
    dragHandle.addEventListener('mousedown', dragMouseDown)
  } else {
    element.addEventListener('mousedown', dragMouseDown)
  }

  function dragMouseDown (e) {
    e.preventDefault()
    e.stopPropagation()

    isDragging = false
    dragStarted = false

    // Get initial positions
    startX = e.clientX
    startY = e.clientY
    initialX = element.offsetLeft
    initialY = element.offsetTop

    document.addEventListener('mouseup', closeDragElement)
    document.addEventListener('mousemove', elementDrag)

    // Change cursor
    if (element.id === 'ojs-theme-toggle-btn') {
      element.style.cursor = 'grabbing'
    }
  }

  function elementDrag (e) {
    e.preventDefault()
    e.stopPropagation()

    if (!dragStarted) {
      dragStarted = true
    }

    isDragging = true

    // Calculate new position based on mouse movement
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    const newLeft = initialX + deltaX
    const newTop = initialY + deltaY

    // Keep element within viewport bounds with some padding
    const padding = 10
    const maxTop = window.innerHeight - element.offsetHeight - padding
    const maxLeft = window.innerWidth - element.offsetWidth - padding

    const boundedLeft = Math.max(padding, Math.min(newLeft, maxLeft))
    const boundedTop = Math.max(padding, Math.min(newTop, maxTop))

    // Apply position immediately
    element.style.left = boundedLeft + "px"
    element.style.top = boundedTop + "px"

    // Mark as dragged for toggle button
    if (element.id === 'ojs-theme-toggle-btn') {
      element.dataset.wasDragged = 'true'
    }
  }

  function closeDragElement () {
    document.removeEventListener('mouseup', closeDragElement)
    document.removeEventListener('mousemove', elementDrag)

    // Reset cursor
    if (element.id === 'ojs-theme-toggle-btn') {
      element.style.cursor = 'grab'

      // If it wasn't dragged, don't mark as dragged
      if (!isDragging || !dragStarted) {
        element.dataset.wasDragged = 'false'
      }
    }

    // Small delay before allowing clicks again
    setTimeout(() => {
      if (element.id === 'ojs-theme-toggle-btn' && !isDragging) {
        element.dataset.wasDragged = 'false'
      }
    }, 50)
  }
}

/**
 * Populates background input with gradient support
 * @param {string} backgroundColor Current background color value
 */
function populateBackgroundInput (backgroundColor) {
  populateColorInput('background-color', backgroundColor)

  // Add gradient toggle if not exists
  const bgGroup = document.querySelector('[for="ote-bg-color"]')?.closest('.ote-control-group')
  if (bgGroup && !document.getElementById('ote-bg-gradient-toggle')) {
    const gradientToggle = document.createElement('div')
    gradientToggle.innerHTML = `
      <label>
        <input type="checkbox" id="ote-bg-gradient-toggle"> Enable Gradient
      </label>
      <div id="ote-gradient-controls" style="display: none; margin-top: 8px;">
        <div class="ote-control-row">
          <label>Color 2:</label>
          <input type="color" id="ote-bg-color2-picker" value="#ffffff">
          <input type="text" id="ote-bg-color2-text" placeholder="#ffffff">
        </div>
        <div class="ote-control-row">
          <label>Direction:</label>
          <input type="range" id="ote-gradient-direction" min="0" max="360" step="1" value="0" class="ote-slider">
          <span id="ote-gradient-direction-text">0°</span>
        </div>
        <div class="ote-control-row">
          <label>Position:</label>
          <input type="range" id="ote-gradient-position" min="0" max="100" step="1" value="50" class="ote-slider">
          <span id="ote-gradient-position-text">50%</span>
        </div>
      </div>
    `
    bgGroup.appendChild(gradientToggle)
    setupGradientEventListeners()
  }
}

/**
 * Populates shadow controls
 * @param {string} boxShadow Current box-shadow value
 */
function populateShadowControls (boxShadow) {
  // Create shadow controls if not exists
  if (!document.getElementById('ote-shadow-group')) {
    const shadowGroup = document.createElement('div')
    shadowGroup.id = 'ote-shadow-group'
    shadowGroup.className = 'ote-control-group'
    shadowGroup.innerHTML = `
      <label for="ote-shadow">
        Box Shadow
        <button class="ote-expand-btn" id="ote-shadow-expand" title="Expand shadow controls">🌑</button>
      </label>
      <div class="ote-control-row">
        <label>
          <input type="checkbox" id="ote-shadow-enabled"> Enable Shadow
        </label>
      </div>
      <div id="ote-shadow-controls" style="display: none;">
        <div class="ote-control-row">
          <label>X Offset:</label>
          <input type="range" id="ote-shadow-x-slider" min="-50" max="50" step="1" value="2" class="ote-slider">
          <input type="text" id="ote-shadow-x-text" placeholder="2px" style="width: 60px;">
          <span class="ote-unit">px</span>
        </div>
        <div class="ote-control-row">
          <label>Y Offset:</label>
          <input type="range" id="ote-shadow-y-slider" min="-50" max="50" step="1" value="2" class="ote-slider">
          <input type="text" id="ote-shadow-y-text" placeholder="2px" style="width: 60px;">
          <span class="ote-unit">px</span>
        </div>
        <div class="ote-control-row">
          <label>Blur:</label>
          <input type="range" id="ote-shadow-blur-slider" min="0" max="50" step="1" value="4" class="ote-slider">
          <input type="text" id="ote-shadow-blur-text" placeholder="4px" style="width: 60px;">
          <span class="ote-unit">px</span>
        </div>
        <div class="ote-control-row">
          <label>Color:</label>
          <input type="color" id="ote-shadow-color-picker" value="#000000">
          <input type="text" id="ote-shadow-color-text" placeholder="#000000">
        </div>
      </div>
    `

    // Insert after border group
    const borderGroup = document.querySelector('[for="ote-border"]')?.closest('.ote-control-group')
    if (borderGroup) {
      borderGroup.parentNode.insertBefore(shadowGroup, borderGroup.nextSibling)
    }

    setupShadowEventListeners()
  }

  // Parse and populate existing shadow values
  if (boxShadow && boxShadow !== 'none') {
    const shadowEnabled = document.getElementById('ote-shadow-enabled')
    if (shadowEnabled) shadowEnabled.checked = true

    // Parse shadow values (simplified)
    const shadowMatch = boxShadow.match(/([-\d.]+)px\s+([-\d.]+)px\s+([\d.]+)px\s+(.+)/)
    if (shadowMatch) {
      const [, x, y, blur, color] = shadowMatch
      populateValueInput('shadow-x', x + 'px')
      populateValueInput('shadow-y', y + 'px')
      populateValueInput('shadow-blur', blur + 'px')
      populateColorInput('shadow-color', color)
    }
  } else {
    // Set default shadow for visibility
    const shadowEnabled = document.getElementById('ote-shadow-enabled')
    if (shadowEnabled) shadowEnabled.checked = false
  }
}

/**
 * Populates dimension controls for images
 * @param {string} width Current width value
 * @param {string} height Current height value
 */
function populateDimensionControls (width, height) {
  // Create dimension controls if not exists
  if (!document.getElementById('ote-dimension-group')) {
    const dimensionGroup = document.createElement('div')
    dimensionGroup.id = 'ote-dimension-group'
    dimensionGroup.className = 'ote-control-group'
    dimensionGroup.innerHTML = `
      <label for="ote-dimensions">Dimensions</label>
      <div class="ote-control-row">
        <label>Width:</label>
        <input type="range" id="ote-width-slider" min="50" max="1000" step="10" class="ote-slider">
        <input type="text" id="ote-width-text" placeholder="auto" style="width: 80px;">
        <span class="ote-unit">px</span>
      </div>
      <div class="ote-control-row">
        <label>Height:</label>
        <input type="range" id="ote-height-slider" min="50" max="1000" step="10" class="ote-slider">
        <input type="text" id="ote-height-text" placeholder="auto" style="width: 80px;">
        <span class="ote-unit">px</span>
      </div>
      <div class="ote-control-row">
        <label>
          <input type="checkbox" id="ote-maintain-aspect-ratio" checked> Maintain Aspect Ratio
        </label>
      </div>
    `

    // Insert after font size group
    const fontGroup = document.querySelector('[for="ote-font-size"]')?.closest('.ote-control-group')
    if (fontGroup) {
      fontGroup.parentNode.insertBefore(dimensionGroup, fontGroup.nextSibling)
    }

    setupDimensionEventListeners()
  }

  // Populate current values
  populateValueInput('width', width)
  populateValueInput('height', height)
}

/**
 * Sets up event listeners for gradient controls
 */
function setupGradientEventListeners () {
  const gradientToggle = document.getElementById('ote-bg-gradient-toggle')
  const gradientControls = document.getElementById('ote-gradient-controls')
  const color2Picker = document.getElementById('ote-bg-color2-picker')
  const color2Text = document.getElementById('ote-bg-color2-text')
  const directionSlider = document.getElementById('ote-gradient-direction')
  const directionText = document.getElementById('ote-gradient-direction-text')
  const positionSlider = document.getElementById('ote-gradient-position')
  const positionText = document.getElementById('ote-gradient-position-text')

  if (gradientToggle) {
    gradientToggle.addEventListener('change', (e) => {
      if (gradientControls) {
        gradientControls.style.display = e.target.checked ? 'block' : 'none'
      }
      updateGradient()
    })
  }

  if (color2Picker) {
    color2Picker.addEventListener('input', (e) => {
      if (color2Text) color2Text.value = e.target.value
      updateGradient()
    })
  }

  if (color2Text) {
    color2Text.addEventListener('input', updateGradient)
  }

  if (directionSlider) {
    directionSlider.addEventListener('input', (e) => {
      if (directionText) directionText.textContent = e.target.value + '°'
      updateGradient()
    })
  }

  if (positionSlider) {
    positionSlider.addEventListener('input', (e) => {
      if (positionText) positionText.textContent = e.target.value + '%'
      updateGradient()
    })
  }
}

/**
 * Updates gradient background
 */
function updateGradient () {
  const gradientToggle = document.getElementById('ote-bg-gradient-toggle')
  if (!gradientToggle?.checked) return

  const color1 = document.getElementById('ote-bg-color-picker')?.value || '#ffffff'
  const color2 = document.getElementById('ote-bg-color2-picker')?.value || '#000000'
  const direction = document.getElementById('ote-gradient-direction')?.value || 0
  const position = document.getElementById('ote-gradient-position')?.value || 50

  const gradientValue = `linear-gradient(${direction}deg, ${color1} 0%, ${color2} ${position}%, ${color1} 100%)`
  applyStyle('background', gradientValue)
}

/**
 * Sets up event listeners for shadow controls
 */
function setupShadowEventListeners () {
  const shadowEnabled = document.getElementById('ote-shadow-enabled')
  const shadowControls = document.getElementById('ote-shadow-controls')
  const shadowExpand = document.getElementById('ote-shadow-expand')

  if (shadowEnabled) {
    shadowEnabled.addEventListener('change', (e) => {
      if (e.target.checked) {
        updateShadow()
        if (shadowControls) shadowControls.style.display = 'block'
      } else {
        applyStyle('box-shadow', 'none')
        if (shadowControls) shadowControls.style.display = 'none'
      }
    })
  }

  if (shadowExpand) {
    shadowExpand.addEventListener('click', () => {
      if (shadowControls) {
        const isVisible = shadowControls.style.display !== 'none'
        shadowControls.style.display = isVisible ? 'none' : 'block'
        shadowExpand.textContent = isVisible ? '🌑' : '🌕'
      }
    })
  }

  // Shadow property controls
  const shadowProps = ['x', 'y', 'blur']
  shadowProps.forEach(prop => {
    const slider = document.getElementById(`ote-shadow-${prop}-slider`)
    const text = document.getElementById(`ote-shadow-${prop}-text`)

    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = e.target.value + 'px'
        if (text) text.value = value
        updateShadow()
      })
    }

    if (text) {
      text.addEventListener('input', (e) => {
        if (slider) slider.value = extractNumericValue(e.target.value)
        updateShadow()
      })
    }
  })

  // Shadow color
  const shadowColorPicker = document.getElementById('ote-shadow-color-picker')
  const shadowColorText = document.getElementById('ote-shadow-color-text')

  if (shadowColorPicker) {
    shadowColorPicker.addEventListener('input', (e) => {
      if (shadowColorText) shadowColorText.value = e.target.value
      updateShadow()
    })
  }

  if (shadowColorText) {
    shadowColorText.addEventListener('input', updateShadow)
  }
}

/**
 * Updates box shadow
 */
function updateShadow () {
  const shadowEnabled = document.getElementById('ote-shadow-enabled')
  if (!shadowEnabled?.checked) return

  const x = document.getElementById('ote-shadow-x-text')?.value || '2px'
  const y = document.getElementById('ote-shadow-y-text')?.value || '2px'
  const blur = document.getElementById('ote-shadow-blur-text')?.value || '4px'
  const color = document.getElementById('ote-shadow-color-text')?.value || '#000000'

  const shadowValue = `${x} ${y} ${blur} ${color}`
  applyStyle('box-shadow', shadowValue)
}

/**
 * Sets up event listeners for dimension controls
 */
function setupDimensionEventListeners () {
  const widthSlider = document.getElementById('ote-width-slider')
  const widthText = document.getElementById('ote-width-text')
  const heightSlider = document.getElementById('ote-height-slider')
  const heightText = document.getElementById('ote-height-text')
  const maintainRatio = document.getElementById('ote-maintain-aspect-ratio')

  let aspectRatio = 1

  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      if (widthText) widthText.value = value

      if (maintainRatio?.checked && heightSlider && heightText) {
        const newHeight = Math.round(parseInt(e.target.value) / aspectRatio)
        heightSlider.value = newHeight
        heightText.value = newHeight + 'px'
        applyStyle('height', newHeight + 'px')
      }

      applyStyle('width', value)
    })
  }

  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      const value = e.target.value + 'px'
      if (heightText) heightText.value = value

      if (maintainRatio?.checked && widthSlider && widthText) {
        const newWidth = Math.round(parseInt(e.target.value) * aspectRatio)
        widthSlider.value = newWidth
        widthText.value = newWidth + 'px'
        applyStyle('width', newWidth + 'px')
      }

      applyStyle('height', value)
    })
  }

  if (widthText) {
    widthText.addEventListener('input', (e) => {
      const numValue = extractNumericValue(e.target.value)
      if (widthSlider) widthSlider.value = numValue
      applyStyle('width', e.target.value)
    })
  }

  if (heightText) {
    heightText.addEventListener('input', (e) => {
      const numValue = extractNumericValue(e.target.value)
      if (heightSlider) heightSlider.value = numValue
      applyStyle('height', e.target.value)
    })
  }

  // Calculate aspect ratio when element is selected
  if (activeElement && isImageElement(activeElement)) {
    const computedStyle = getComputedStyle(activeElement)
    const width = extractNumericValue(computedStyle.width)
    const height = extractNumericValue(computedStyle.height)
    if (width && height) {
      aspectRatio = width / height
    }
  }
}
