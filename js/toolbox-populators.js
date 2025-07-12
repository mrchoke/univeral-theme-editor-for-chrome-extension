/**
 * Populates the toolbox inputs with the current styles of the selected element.
 * @param {HTMLElement} el The selected element.
 */
function populateToolbox (el) {
  debugLog('📝 Populating toolbox for new element...')

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

  debugLog('📝 Current element values:', {
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
  populateHeightInput(height)

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
  const inputs = document.querySelectorAll('#universal-theme-editor-toolbox input, #universal-theme-editor-toolbox select')
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false
    } else if (input.type === 'color') {
      // Color inputs require valid hex format, use default color
      input.value = '#000000'
    } else if (input.type === 'range') {
      // Range inputs should be set to their default/minimum value
      input.value = input.min || '0'
    } else if (input.tagName === 'SELECT') {
      // Select elements should be set to first option or default
      if (input.options && input.options.length > 0) {
        input.selectedIndex = 0
      }
    } else {
      // Text inputs can safely be cleared
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
  // Handle special case for background-color IDs
  let textInputId, colorInputId
  if (property === 'background-color') {
    textInputId = 'ote-bg-color-text'
    colorInputId = 'ote-bg-color-picker'
  } else {
    textInputId = `ote-${property.replace('-color', '')}-text`
    colorInputId = `ote-${property}-picker`
  }

  const textInput = document.getElementById(textInputId)
  const colorInput = document.getElementById(colorInputId)

  if (textInput) {
    textInput.value = value || ''
    debugLog(`📝 Set ${property} text input to:`, value)
  }

  if (colorInput && value) {
    const hexColor = safeColorToHex(value, '#000000')
    colorInput.value = hexColor
    debugLog(`🎨 Set ${property} color picker to:`, hexColor)
  } else if (colorInput) {
    // If no value provided, set safe default
    colorInput.value = '#000000'
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
    debugLog(`📝 Set ${property} text input to:`, value)
  }

  if (sliderInput) {
    const numericValue = extractNumericValue(value)
    sliderInput.value = numericValue
    debugLog(`🎚️ Set ${property} slider to:`, numericValue)
  }
}

/**
 * Populates height input with current value
 * @param {string} height Current height value
 */
function populateHeightInput (height) {
  const heightText = document.getElementById('ote-height-text')
  const heightSlider = document.getElementById('ote-height-slider')
  const heightUnit = document.getElementById('ote-height-unit')

  if (heightText) {
    const numericValue = extractNumericValue(height)
    const unit = height.replace(/[\d.]/g, '') || 'px'

    heightText.value = numericValue || 'auto'

    if (heightUnit) {
      heightUnit.value = height === 'auto' || numericValue === 0 ? 'auto' : unit
    }

    if (heightSlider && numericValue > 0) {
      heightSlider.value = Math.min(numericValue, 500)
    }
  }
}

/**
 * Populates background input with special handling for background-color
 */
function populateBackgroundInput (backgroundColor) {
  populateColorInput('background-color', backgroundColor)
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
    const colorValue = borderColor.split(' ')[0] || '#000000'
    const hexColor = safeColorToHex(colorValue, '#000000')
    borderColorPicker.value = hexColor
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
      const hexColor = safeColorToHex(color, '#000000')
      colorPicker.value = hexColor
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
 * Populates shadow controls
 * @param {string} boxShadow Current box-shadow value
 */
function populateShadowControls (boxShadow) {
  const shadowText = document.getElementById('ote-shadow-text')
  const shadowToggle = document.getElementById('ote-shadow-toggle')

  if (shadowText) {
    shadowText.value = boxShadow || 'none'
  }

  if (shadowToggle) {
    shadowToggle.checked = boxShadow && boxShadow !== 'none'
  }
}

/**
 * Populates dimension controls for images
 * @param {string} width Current width value
 * @param {string} height Current height value
 */
function populateDimensionControls (width, height) {
  // Width controls
  const widthText = document.getElementById('ote-width-text')
  const widthSlider = document.getElementById('ote-width-slider')
  const widthUnit = document.getElementById('ote-width-unit')

  if (widthText) {
    const numericValue = extractNumericValue(width)
    const unit = width.replace(/[\d.]/g, '') || 'px'

    widthText.value = numericValue || '100'

    if (widthUnit) {
      widthUnit.value = unit
    }

    if (widthSlider && numericValue > 0) {
      widthSlider.value = Math.min(numericValue, 500)
    }
  }

  // Height is handled by populateHeightInput
  populateHeightInput(height)
}

/**
 * Safely converts any color value to a valid hex color for color input
 * @param {string} colorValue The color value to convert
 * @returns {string} Valid hex color or fallback
 */
function safeColorToHex(colorValue, fallback = '#000000') {
  if (!colorValue || colorValue === 'none') {
    return fallback
  }

  try {
    // Already valid hex color
    if (colorValue.startsWith('#') && /^#[0-9A-F]{6}$/i.test(colorValue)) {
      return colorValue
    }

    // RGB/RGBA color
    if (colorValue.startsWith('rgb')) {
      const rgb = colorValue.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        return '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
      }
    }

    // Handle transparent
    if (colorValue === 'transparent' || colorValue === 'rgba(0, 0, 0, 0)') {
      return '#f0f0f0' // Light gray as visual indicator
    }

    // Try to resolve named colors
    const tempElement = document.createElement('div')
    tempElement.style.color = colorValue
    document.body.appendChild(tempElement)
    const computedColor = getComputedStyle(tempElement).color
    document.body.removeChild(tempElement)

    if (computedColor && computedColor.startsWith('rgb')) {
      const rgb = computedColor.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        return '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
      }
    }

    return fallback
  } catch (e) {
    debugWarn('Error converting color:', colorValue, e)
    return fallback
  }
}
