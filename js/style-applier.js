/**
 * Applies a CSS style to the active element and updates the state.
 * @param {string} property The CSS property to change.
 * @param {string} value The new value for the property.
 */
function applyStyle (property, value) {
  if (!activeElement) {
    debugLog('⚠️ No active element to apply style to')
    return
  }

  debugLog(`🎨 Applying style: ${property} = ${value}`)

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

  if (textInput && textInput.value !== value) {
    textInput.value = value
  }
  if (colorInput && colorInput.value !== value) {
    colorInput.value = value
  }
  if (sliderInput && sliderInput.value !== extractNumericValue(value)) {
    sliderInput.value = extractNumericValue(value)
  }
}

/**
 * Exports the collected CSS rules as a .css file.
 */
function exportCss () {
  let cssString = '/* --- Custom Universal Theme Styles --- */\n\n'
  for (const selector in cssRules) {
    cssString += `${selector} {\n`
    for (const property in cssRules[selector]) {
      cssString += `  ${property}: ${cssRules[selector][property]};\n`
    }
    cssString += '}\n\n'
  }

  const blob = new Blob([cssString], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'custom-universal-theme.css'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Clears styles for current page only
 */
function clearCurrentPageStyles () {
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
  const styleSheet = document.getElementById('universal-dynamic-styles')
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
  const styleSheet = document.getElementById('universal-dynamic-styles')
  if (styleSheet) {
    styleSheet.remove()
  }

  // Remove highlights
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
    activeElement = null
  }

  // Hide toolbox
  const toolbox = document.getElementById('universal-theme-editor-toolbox')
  if (toolbox) {
    toolbox.classList.remove('visible')
  }

  saveState()
  console.log('🧹 Cleared all saved styles')
}
