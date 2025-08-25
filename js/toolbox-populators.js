/**
 * Populates the toolbox inputs with the current styles of the selected element.
 * @param {HTMLElement} el The selected element.
 */
function populateToolbox (el) {
  debugLog('📝 Populating toolbox for new element')

  // Clear all input fields first to avoid showing old values
  clearAllInputs()

  const computedStyle = getComputedStyle(el)
  const isImage = isImageElement(el)

  // Prefer previously saved/custom values (cssRules/currentHistory) when present so
  // the UI reflects what the user last applied. Fallback to computed styles.
  const selector = (typeof generateSelector === 'function') ? generateSelector(el) : null
  const saved = (typeof cssRules !== 'undefined' && selector && cssRules[selector]) ? cssRules[selector] : {}
  const history = (typeof currentHistory !== 'undefined' && selector && currentHistory[selector]) ? currentHistory[selector] : {}

  // Normalize property keys (accept camelCase like borderColor as well as kebab-case)
  const normalizeProps = (obj) => {
    if (!obj) return {}
    const out = {}
    for (const k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
      const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      out[kebab] = obj[k]
    }
    return out
  }

  const savedNorm = normalizeProps(saved)
  const historyNorm = normalizeProps(history)

  const pick = (prop, fallbackProp) => {
    // prefer saved custom rule (normalized), then session history, then computed style
    if (savedNorm && typeof savedNorm[prop] !== 'undefined') return savedNorm[prop]
    if (historyNorm && typeof historyNorm[prop] !== 'undefined') return historyNorm[prop]
    if (fallbackProp && savedNorm && typeof savedNorm[fallbackProp] !== 'undefined') return savedNorm[fallbackProp]
    if (fallbackProp && historyNorm && typeof historyNorm[fallbackProp] !== 'undefined') return historyNorm[fallbackProp]
    return computedStyle.getPropertyValue(prop)
  }

  // Get values (prefer saved/custom)
  const color = pick('color')
  const backgroundColor = pick('background-color')
  const backgroundImage = pick('background-image')
  const background = pick('background')
  const fontSize = pick('font-size')
  const padding = pick('padding')
  const margin = pick('margin')
  const border = pick('border')
  const borderRadius = pick('border-radius')
  const boxShadow = pick('box-shadow')
  const width = pick('width')
  const height = pick('height')

  debugLog('📝 Current element values (saved|history|computed):', {
    selector, color, backgroundColor, backgroundImage, background, fontSize, padding, margin, border, borderRadius, boxShadow, width, height, isImage
  })

  // Show/hide controls based on element type
  toggleControlsVisibility(isImage)

  // Populate basic controls
  populateColorInput('color', color)
  populateBackgroundInput(backgroundColor, backgroundImage, background)
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
      // Preserve persistent toggles (don't clear debug or force-important toggles)
      if (input.id === 'ote-debug-toggle' || input.id === 'ote-force-important-toggle') {
        return
      }
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
    const hexColor = getHexColor(value, '#000000')
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
 * Populates background input with special handling for gradient
 * @param {string} backgroundColor Current background-color value
 * @param {string} backgroundImage Current background-image value  
 * @param {string} background Current background shorthand value
 */
function populateBackgroundInput (backgroundColor, backgroundImage, background) {
  // Check for gradient in background-image, background, or saved values
  const gradientValue = backgroundImage || background
  const hasGradient = gradientValue && gradientValue.includes('linear-gradient')

  debugLog('🎨 Background values:', { backgroundColor, backgroundImage, background, hasGradient, gradientValue })

  if (hasGradient) {
    // For gradients, reset controls first and parse from actual gradient
    // IMPORTANT: Don't use backgroundColor when we have a gradient
    resetGradientControls()
    populateGradientControls(gradientValue)
  } else {
    // For solid colors, reset gradient and populate background color
    resetGradientControls()
    populateColorInput('background-color', backgroundColor)
  }
}

/**
 * Populates border control fields
 */
function extractColorFromBorderShorthand (shorthand) {
  debugLog('  extractColorFromBorderShorthand input:', shorthand)

  if (!shorthand || typeof shorthand !== 'string') {
    debugLog('  extractColorFromBorderShorthand: invalid input')
    return null
  }

  // Match rgba(...) or rgb(...), hex (#fff or #ffffff), or named color at the end
  const m = shorthand.match(/(rgba?\([^\)]+\)|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|[a-zA-Z]+)/)
  const result = m ? m[0] : null
  debugLog('  extractColorFromBorderShorthand result:', result)
  return result
} function populateBorderControls (el, computedStyle) {
  // Main border controls - prefer saved/custom values then history then computed
  const selector = (typeof generateSelector === 'function') ? generateSelector(el) : null
  const saved = (typeof cssRules !== 'undefined' && selector && cssRules[selector]) ? cssRules[selector] : {}
  const history = (typeof currentHistory !== 'undefined' && selector && currentHistory[selector]) ? currentHistory[selector] : {}

  // normalize saved/history keys to kebab-case for consistency
  const normalizeProps = (obj) => {
    if (!obj) return {}
    const out = {}
    for (const k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
      const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      out[kebab] = obj[k]
    }
    return out
  }

  const savedNorm = normalizeProps(saved)
  const historyNorm = normalizeProps(history)

  const pick = (prop, fallbackProp) => {
    if (savedNorm && typeof savedNorm[prop] !== 'undefined') return savedNorm[prop]
    if (historyNorm && typeof historyNorm[prop] !== 'undefined') return historyNorm[prop]
    if (fallbackProp && savedNorm && typeof savedNorm[fallbackProp] !== 'undefined') return savedNorm[fallbackProp]
    if (fallbackProp && historyNorm && typeof historyNorm[fallbackProp] !== 'undefined') return historyNorm[fallbackProp]
    return computedStyle.getPropertyValue(prop)
  }

  const borderWidth = pick('border-width') || '0px'
  const borderStyle = pick('border-style') || 'solid'
  const borderRadius = pick('border-radius') || '0px'

  // Debug logging for border color
  debugLog('Debug border color resolution:')
  debugLog('  savedNorm:', savedNorm)
  debugLog('  historyNorm:', historyNorm)

  // Try different border color property variations
  let rawColorValue = pick('border-color')
  debugLog('  pick(border-color):', rawColorValue)

  if (!rawColorValue || rawColorValue === 'initial' || rawColorValue === 'inherit') {
    // Try border shorthand
    rawColorValue = pick('border')
    debugLog('  pick(border):', rawColorValue)
  }

  let finalColor = extractColorFromBorderShorthand(rawColorValue)
  debugLog('  extractColorFromBorderShorthand result:', finalColor)

  if (!finalColor || finalColor === 'initial' || finalColor === 'inherit') {
    // Fallback to computed color only as last resort
    finalColor = computedStyle.getPropertyValue('border-color')
    debugLog('  fallback to computed border-color:', finalColor)
  } finalColor = finalColor || '#000000' // Final fallback to black

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
    debugLog('  Setting border color picker:')
    debugLog('    finalColor:', finalColor)
    const hexColor = getHexColor(finalColor, '#000000')
    debugLog('    hexColor (after conversion):', hexColor)
    borderColorPicker.value = hexColor
    debugLog('    color picker value set to:', borderColorPicker.value)
  }

  // Border radius
  const borderRadiusText = document.getElementById('ote-border-radius-text')
  const borderRadiusSlider = document.getElementById('ote-border-radius-slider')
  if (borderRadiusText) borderRadiusText.value = borderRadius.split(' ')[0] || '0px'
  if (borderRadiusSlider) borderRadiusSlider.value = extractNumericValue(borderRadius)

  // Individual border sides and corners (pass saved/history for side-specific fallbacks)
  populateIndividualBorderControls(computedStyle, saved, history)
}

/**
 * Populates individual border side and corner controls
 */
function populateIndividualBorderControls (computedStyle, saved = {}, history = {}) {
  const sides = ['top', 'right', 'bottom', 'left']
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

  // Normalize saved/history keys to kebab-case so we can find values like 'border-top'
  const normalize = (obj) => {
    const out = {}
    for (const k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
      const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      out[kebab] = obj[k]
    }
    return out
  }

  const savedNorm = normalize(saved || {})
  const historyNorm = normalize(history || {})

  // Populate individual sides
  sides.forEach(side => {
    // prefer side-specific saved value, then generic border-* saved, then history, then computed
    const widthProp = `border-${side}-width`
    const styleProp = `border-${side}-style`
    const colorProp = `border-${side}-color`

    const width = (savedNorm && typeof savedNorm[widthProp] !== 'undefined') ? savedNorm[widthProp]
      : (historyNorm && typeof historyNorm[widthProp] !== 'undefined') ? historyNorm[widthProp]
        : computedStyle.getPropertyValue(widthProp) || '0px'

    const style = (savedNorm && typeof savedNorm[styleProp] !== 'undefined') ? savedNorm[styleProp]
      : (historyNorm && typeof historyNorm[styleProp] !== 'undefined') ? historyNorm[styleProp]
        : computedStyle.getPropertyValue(styleProp) || 'solid'

    // Resolve color with clear priority
    const shorthandProp = `border-${side}`
    let rawValue = savedNorm[colorProp] || historyNorm[colorProp] ||
      savedNorm[shorthandProp] || historyNorm[shorthandProp] ||
      savedNorm['border-color'] || historyNorm['border-color'] ||
      savedNorm['border'] || historyNorm['border']

    let finalColor = null
    if (rawValue) {
      finalColor = extractColorFromBorderShorthand(rawValue)
    }

    if (!finalColor) {
      finalColor = computedStyle.getPropertyValue(colorProp)
    }

    finalColor = finalColor || '#000000'

    const widthText = document.getElementById(`ote-border-${side}-width-text`)
    const widthSlider = document.getElementById(`ote-border-${side}-width-slider`)
    const styleSelect = document.getElementById(`ote-border-${side}-style`)
    const colorPicker = document.getElementById(`ote-border-${side}-color-picker`)

    if (widthText) widthText.value = width
    if (widthSlider) widthSlider.value = extractNumericValue(width)
    if (styleSelect) styleSelect.value = style
    if (colorPicker) {
      debugLog('🔍 individual side color raw:', finalColor, 'for side:', side)
      const hexColor = getHexColor(finalColor, '#000000')
      debugLog('🔍 individual side color hex:', hexColor, 'for side:', side)
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
function safeColorToHex (colorValue, fallback = '#000000') {
  if (!colorValue || colorValue === 'none') {
    return fallback
  }

  try {
    // Already valid hex color
    if (colorValue.startsWith('#')) {
      // 6-digit hex
      if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
        return colorValue.toLowerCase()
      }
      // 3-digit hex - expand to 6-digit
      if (/^#[0-9A-F]{3}$/i.test(colorValue)) {
        const short = colorValue.slice(1)
        const full = '#' + short.split('').map(c => c + c).join('')
        return full.toLowerCase()
      }
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

/**
 * Convert an rgb()/rgba() string to hex (#rrggbb). If rgba has alpha, alpha is ignored.
 * Accepts formats like 'rgb(255, 0, 0)' or 'rgba(255,0,0,0.5)'.
 */
function rgbStringToHex (rgbString) {
  if (!rgbString || typeof rgbString !== 'string') return null
  const m = rgbString.match(/rgba?\s*\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(p => p.trim())
  if (parts.length < 3) return null
  const r = Math.max(0, Math.min(255, parseInt(parts[0], 10) || 0))
  const g = Math.max(0, Math.min(255, parseInt(parts[1], 10) || 0))
  const b = Math.max(0, Math.min(255, parseInt(parts[2], 10) || 0))
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase()
}

/**
 * Normalize any color-like value to a hex string acceptable by <input type="color">.
 * Handles: hex (#fff, #ffffff), rgb(), rgba(), named colors.
 */
function getHexColor (value, fallback = '#000000') {
  if (!value) return fallback
  try {
    const str = String(value).trim()
    if (str.startsWith('rgb')) {
      const h = rgbStringToHex(str)
      if (h) return h
    }
    // Delegate to existing safeColorToHex for other formats (hex, named, etc.)
    return safeColorToHex(str, fallback)
  } catch (e) {
    debugWarn('getHexColor error for', value, e)
    return fallback
  }
}

/**
 * Populates gradient controls with values from a linear-gradient string
 * @param {string} gradientValue The linear-gradient CSS value
 */
function populateGradientControls (gradientValue) {
  debugLog('🎨 Parsing gradient:', gradientValue)

  // Parse gradient: linear-gradient(angle, color1 position1, color2 position2)
  // Use more sophisticated regex that handles nested parentheses in RGB colors
  const gradientMatch = gradientValue.match(/linear-gradient\((.*)\)$/)
  if (!gradientMatch) {
    debugLog('❌ Invalid gradient format')
    resetGradientControls()
    return
  }

  const gradientContent = gradientMatch[1]
  debugLog('🎨 Gradient content:', gradientContent)

  // Smart parsing that handles rgb() colors with commas
  let angle = '90'
  let color1 = '#ffffff'
  let color2 = '#000000'
  let position = '50'

  // Extract angle first
  const angleMatch = gradientContent.match(/^(\d+deg)/i)
  let contentAfterAngle = gradientContent

  if (angleMatch) {
    angle = angleMatch[1].replace('deg', '')
    contentAfterAngle = gradientContent.replace(angleMatch[0], '').replace(/^,\s*/, '')
    debugLog('🎨 Found angle:', angle)
  }

  debugLog('🎨 Content after angle:', contentAfterAngle)

  // Manual split that respects RGB parentheses
  const parts = []
  let currentPart = ''
  let parenDepth = 0

  for (let i = 0; i < contentAfterAngle.length; i++) {
    const char = contentAfterAngle[i]

    if (char === '(') {
      parenDepth++
    } else if (char === ')') {
      parenDepth--
    }

    if (char === ',' && parenDepth === 0) {
      parts.push(currentPart.trim())
      currentPart = ''
    } else {
      currentPart += char
    }
  }

  if (currentPart.trim()) {
    parts.push(currentPart.trim())
  }

  debugLog('🎨 Smart split parts:', parts)

  // Extract colors from parts
  if (parts.length >= 1) {
    const color1Match = parts[0].match(/^(.+?)(?:\s+(\d+)%)?$/)
    if (color1Match) {
      color1 = color1Match[1].trim()
      debugLog('🎨 Parsed color1:', color1)
    }
  }

  if (parts.length >= 2) {
    const color2Match = parts[1].match(/^(.+?)(?:\s+(\d+)%)?$/)
    if (color2Match) {
      color2 = color2Match[1].trim()
      if (color2Match[2]) {
        position = color2Match[2]
      }
      debugLog('🎨 Parsed color2:', color2, 'position:', position)
    }
  }

  debugLog('🎨 Final parsed gradient values:', { angle, color1, color2, position })

  // Enable gradient toggle
  const gradientToggle = document.getElementById('ote-gradient-toggle')
  const gradientControls = document.getElementById('ote-gradient-controls')

  if (gradientToggle) {
    gradientToggle.checked = true
    debugLog('🎨 Enabled gradient toggle')
  }

  if (gradientControls) {
    gradientControls.style.display = 'block'
    debugLog('🎨 Showed gradient controls')
  }

  // Populate gradient controls
  populateGradientInputs(angle, color1, color2, position)
}

/**
 * Populates individual gradient input fields
 * @param {string} angle Gradient angle
 * @param {string} color1 First color
 * @param {string} color2 Second color  
 * @param {string} position Position of second color
 */
function populateGradientInputs (angle, color1, color2, position) {
  // Angle controls
  const angleSlider = document.getElementById('ote-gradient-angle-slider')
  const angleText = document.getElementById('ote-gradient-angle-text')

  if (angleSlider) angleSlider.value = angle
  if (angleText) angleText.value = angle

  // Position controls  
  const positionSlider = document.getElementById('ote-gradient-position-slider')
  const positionText = document.getElementById('ote-gradient-position-text')

  if (positionSlider) positionSlider.value = position
  if (positionText) positionText.value = position

  // Color 1 controls (main background color picker)
  const color1Picker = document.getElementById('ote-bg-color-picker')
  const color1Text = document.getElementById('ote-bg-color-text')

  if (color1Picker && color1 && color1 !== '#ffffff') {
    const hexColor1 = getHexColor(color1, '#ffffff')
    color1Picker.value = hexColor1
    debugLog('🎨 Set color1 picker to:', hexColor1, 'from gradient color1:', color1)
  }

  if (color1Text && color1 && color1 !== '#ffffff') {
    color1Text.value = color1
    debugLog('📝 Set color1 text to:', color1)
  }

  // Color 2 controls (second background color picker)
  const color2Picker = document.getElementById('ote-bg-color2-picker')
  const color2Text = document.getElementById('ote-bg-color2-text')

  if (color2Picker && color2 && color2 !== '#000000') {
    const hexColor2 = getHexColor(color2, '#000000')
    color2Picker.value = hexColor2
    debugLog('🎨 Set color2 picker to:', hexColor2, 'from gradient color2:', color2)
  }

  if (color2Text && color2 && color2 !== '#000000') {
    color2Text.value = color2
    debugLog('📝 Set color2 text to:', color2)
  }

  debugLog('🎨 Populated gradient controls:', { angle, color1, color2, position })
}

/**
 * Resets gradient controls to default state
 */
function resetGradientControls () {
  // Disable gradient toggle
  const gradientToggle = document.getElementById('ote-gradient-toggle')
  const gradientControls = document.getElementById('ote-gradient-controls')

  if (gradientToggle) {
    gradientToggle.checked = false
  }

  if (gradientControls) {
    gradientControls.style.display = 'none'
  }

  // Reset gradient values to defaults
  const angleSlider = document.getElementById('ote-gradient-angle-slider')
  const angleText = document.getElementById('ote-gradient-angle-text')
  const positionSlider = document.getElementById('ote-gradient-position-slider')
  const positionText = document.getElementById('ote-gradient-position-text')
  const color2Picker = document.getElementById('ote-bg-color2-picker')
  const color2Text = document.getElementById('ote-bg-color2-text')

  if (angleSlider) angleSlider.value = '90'
  if (angleText) angleText.value = '90'
  if (positionSlider) positionSlider.value = '50'
  if (positionText) positionText.value = '50'
  if (color2Picker) color2Picker.value = '#000000'
  if (color2Text) color2Text.value = '#000000'

  debugLog('🎨 Reset gradient controls to default')
}
