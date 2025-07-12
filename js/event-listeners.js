/**
 * Sets up event listeners for toolbox functionality
 */
function setupEventListeners () {
  debugLog('🔧 Setting up toolbox event listeners...')

  // Toolbox functionality
  const toolbox = document.getElementById('universal-theme-editor-toolbox')
  if (!toolbox) {
    debugLog('❌ Toolbox not found!')
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

  // Padding expand button
  const paddingExpandBtn = document.getElementById('ote-padding-expand')
  if (paddingExpandBtn) {
    paddingExpandBtn.addEventListener('click', togglePaddingExpand)
  }

  // Margin expand button
  const marginExpandBtn = document.getElementById('ote-margin-expand')
  if (marginExpandBtn) {
    marginExpandBtn.addEventListener('click', toggleMarginExpand)
  }

  // Debug toggle
  const debugToggle = document.getElementById('ote-debug-toggle')
  if (debugToggle) {
    // Load saved debug state
    debugToggle.checked = localStorage.getItem('ote-debug-mode') === 'true'
    debugMode = debugToggle.checked

    debugToggle.addEventListener('change', (e) => {
      debugMode = e.target.checked
      localStorage.setItem('ote-debug-mode', debugMode.toString())
      debugLog('🐛 Debug mode:', debugMode ? 'ON' : 'OFF')
    })
  }

  // Element hierarchy selector
  const hierarchySelect = document.getElementById('ote-hierarchy-select')
  if (hierarchySelect) {
    hierarchySelect.addEventListener('change', (e) => {
      if (e.target.value) {
        const selectedIndex = parseInt(e.target.value)
        if (elementHierarchy[selectedIndex]) {
          selectElementFromHierarchy(selectedIndex)
        }
      }
    })
  }

  // Height controls
  setupHeightEventListeners()

  // Listen for changes in all input fields
  setupInputEventListeners()

  // Make toolbox draggable
  makeDraggable(toolbox, '.ote-header')

  debugLog('✅ Toolbox event listeners set up successfully!')
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
    // Handle special case for background-color IDs
    let textInputId, colorInputId, sliderInputId
    if (control.prop === 'background-color') {
      textInputId = 'ote-bg-color-text'
      colorInputId = 'ote-bg-color-picker'
      sliderInputId = 'ote-bg-color-slider'
    } else {
      textInputId = `ote-${control.prop.replace('-color', '')}-text`
      colorInputId = `ote-${control.prop}-picker`
      sliderInputId = `ote-${control.prop.replace('-color', '')}-slider`
    }

    const textInput = document.getElementById(textInputId)
    const colorInput = document.getElementById(colorInputId)
    const sliderInput = document.getElementById(sliderInputId)

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
        if (textInput) textInput.value = e.target.value
        applyStyle(control.prop, e.target.value)
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

  // Gradient controls
  setupGradientEventListeners()
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
 * Toggles the expanded padding controls
 */
function togglePaddingExpand () {
  const expandedControls = document.getElementById('ote-padding-expanded')
  const expandBtn = document.getElementById('ote-padding-expand')

  if (expandedControls && expandBtn) {
    const isExpanded = expandedControls.style.display !== 'none'
    expandedControls.style.display = isExpanded ? 'none' : 'block'
    expandBtn.textContent = isExpanded ? '⚙️' : '📐'
    expandBtn.title = isExpanded ? 'Expand padding controls' : 'Collapse padding controls'

    // Setup event listeners when first expanded
    if (!isExpanded) {
      setupPaddingEventListeners()
    }
  }
}

/**
 * Toggles the expanded margin controls
 */
function toggleMarginExpand () {
  const expandedControls = document.getElementById('ote-margin-expanded')
  const expandBtn = document.getElementById('ote-margin-expand')

  if (expandedControls && expandBtn) {
    const isExpanded = expandedControls.style.display !== 'none'
    expandedControls.style.display = isExpanded ? 'none' : 'block'
    expandBtn.textContent = isExpanded ? '⚙️' : '📐'
    expandBtn.title = isExpanded ? 'Expand margin controls' : 'Collapse margin controls'

    // Setup event listeners when first expanded
    if (!isExpanded) {
      setupMarginEventListeners()
    }
  }
}

/**
 * Sets up event listeners for individual padding sides
 */
function setupPaddingEventListeners () {
  const sides = ['top', 'right', 'bottom', 'left']

  sides.forEach(side => {
    const slider = document.getElementById(`ote-padding-${side}-slider`)
    const text = document.getElementById(`ote-padding-${side}-text`)

    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = e.target.value + 'px'
        applyStyle(`padding-${side}`, value)
        if (text) text.value = e.target.value
      })
    }

    if (text) {
      text.addEventListener('input', (e) => {
        applyStyle(`padding-${side}`, e.target.value)
        if (slider) slider.value = extractNumericValue(e.target.value)
      })
    }
  })
}

/**
 * Sets up event listeners for individual margin sides
 */
function setupMarginEventListeners () {
  const sides = ['top', 'right', 'bottom', 'left']

  sides.forEach(side => {
    const slider = document.getElementById(`ote-margin-${side}-slider`)
    const text = document.getElementById(`ote-margin-${side}-text`)

    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = e.target.value + 'px'
        applyStyle(`margin-${side}`, value)
        if (text) text.value = e.target.value
      })
    }

    if (text) {
      text.addEventListener('input', (e) => {
        applyStyle(`margin-${side}`, e.target.value)
        if (slider) slider.value = extractNumericValue(e.target.value)
      })
    }
  })
}

/**
 * Sets up event listeners for height controls
 */
function setupHeightEventListeners () {
  const heightSlider = document.getElementById('ote-height-slider')
  const heightText = document.getElementById('ote-height-text')
  const heightUnit = document.getElementById('ote-height-unit')

  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      const unit = heightUnit?.value || 'px'
      const value = unit === 'auto' ? 'auto' : e.target.value + unit
      applyStyle('height', value)
      if (heightText) heightText.value = unit === 'auto' ? 'auto' : e.target.value
    })
  }

  if (heightText) {
    heightText.addEventListener('input', (e) => {
      const value = e.target.value
      const unit = heightUnit?.value || 'px'
      const finalValue = value === 'auto' || unit === 'auto' ? 'auto' : value + (value.includes(unit) ? '' : unit)
      applyStyle('height', finalValue)

      if (heightSlider && value !== 'auto' && unit !== 'auto') {
        heightSlider.value = extractNumericValue(value)
      }
    })
  }

  if (heightUnit) {
    heightUnit.addEventListener('change', (e) => {
      const unit = e.target.value
      const currentValue = heightText?.value || '100'

      if (unit === 'auto') {
        applyStyle('height', 'auto')
        if (heightText) heightText.value = 'auto'
      } else {
        const numericValue = extractNumericValue(currentValue)
        const newValue = numericValue + unit
        applyStyle('height', newValue)
        if (heightText) heightText.value = numericValue.toString()
      }
    })
  }
}

/**
 * Sets up event listeners for gradient controls
 */
function setupGradientEventListeners () {
  const gradientToggle = document.getElementById('ote-gradient-toggle')
  const gradientControls = document.getElementById('ote-gradient-controls')
  const bgColorPicker = document.getElementById('ote-bg-color-picker')
  const bgColorText = document.getElementById('ote-bg-color-text')
  const bgColor2Picker = document.getElementById('ote-bg-color2-picker')
  const bgColor2Text = document.getElementById('ote-bg-color2-text')
  const angleSlider = document.getElementById('ote-gradient-angle-slider')
  const angleText = document.getElementById('ote-gradient-angle-text')
  const positionSlider = document.getElementById('ote-gradient-position-slider')
  const positionText = document.getElementById('ote-gradient-position-text')

  // Toggle gradient controls visibility
  if (gradientToggle && gradientControls) {
    gradientToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        gradientControls.style.display = 'block'
        // Apply gradient immediately if colors are set
        applyGradientBackground()
      } else {
        gradientControls.style.display = 'none'
        // Apply solid color instead
        const solidColor = bgColorPicker?.value || bgColorText?.value || '#ffffff'
        applyStyle('background', solidColor)
      }
    })
  }

  // First color controls
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', (e) => {
      if (bgColorText) bgColorText.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      } else {
        applyStyle('background-color', e.target.value)
      }
    })
  }

  if (bgColorText) {
    bgColorText.addEventListener('input', (e) => {
      if (bgColorPicker) bgColorPicker.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      } else {
        applyStyle('background-color', e.target.value)
      }
    })
  }

  // Second color controls
  if (bgColor2Picker) {
    bgColor2Picker.addEventListener('input', (e) => {
      if (bgColor2Text) bgColor2Text.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }

  if (bgColor2Text) {
    bgColor2Text.addEventListener('input', (e) => {
      if (bgColor2Picker) bgColor2Picker.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }

  // Angle controls
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      if (angleText) angleText.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }

  if (angleText) {
    angleText.addEventListener('input', (e) => {
      if (angleSlider) angleSlider.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }

  // Position controls
  if (positionSlider) {
    positionSlider.addEventListener('input', (e) => {
      if (positionText) positionText.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }

  if (positionText) {
    positionText.addEventListener('input', (e) => {
      if (positionSlider) positionSlider.value = e.target.value
      if (gradientToggle?.checked) {
        applyGradientBackground()
      }
    })
  }
}

/**
 * Applies gradient background based on current settings
 */
function applyGradientBackground () {
  const color1 = document.getElementById('ote-bg-color-picker')?.value || '#ffffff'
  const color2 = document.getElementById('ote-bg-color2-picker')?.value || '#000000'
  const angle = document.getElementById('ote-gradient-angle-slider')?.value || '90'
  const position = document.getElementById('ote-gradient-position-slider')?.value || '50'

  const gradientValue = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} ${position}%)`

  debugLog('🎨 Applying gradient:', gradientValue)
  applyStyle('background', gradientValue)
}
