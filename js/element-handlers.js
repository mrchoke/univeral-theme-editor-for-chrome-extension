/**
 * Handles the selection of an element on the page.
 * @param {MouseEvent} e The mousedown event.
 */
function handleElementSelection (e) {
  if (!e.altKey) return // Only activate on Alt key press

  debugLog('🖱️ Element selection triggered with Alt key:', e.target)

  // Prevent default behavior (especially for links)
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  // Initialize full extension if not already done
  if (!document.getElementById('universal-theme-editor-toolbox')) {
    initializeFullExtension()
  }

  const target = e.target

  // Don't select the toolbox, toggle button, options panel, or their children
  if (target.closest('#universal-theme-editor-toolbox') ||
    target.closest('#universal-theme-toggle-btn') ||
    target.closest('#universal-theme-options-panel') ||
    target.closest('#ote-about-dialog') ||
    target.closest('#ote-instruction')) {
    return
  }

  // Remove highlight from the previously selected element
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
  }

  // Set new active element and highlight it
  activeElement = target
  activeElement.classList.add(HIGHLIGHT_CLASS)

  // Build element hierarchy for multi-level selection
  buildElementHierarchy(activeElement)

  // Store original values for undo functionality
  storeOriginalValues(activeElement)

  // Update and show the toolbox
  const selector = generateSelector(activeElement)
  debugLog('✅ Selected element with selector:', selector)

  const selectorElement = document.getElementById('ote-current-selector')
  if (selectorElement) {
    selectorElement.textContent = selector
  }

  // Populate toolbox with current element values
  populateToolbox(activeElement)
  showToolbox()
}

/**
 * Builds element hierarchy for multi-level selection
 * @param {HTMLElement} element The selected element
 */
function buildElementHierarchy (element) {
  elementHierarchy = []
  let current = element

  while (current && current !== document.body) {
    elementHierarchy.unshift({
      element: current,
      selector: generateSelector(current),
      tagName: current.tagName.toLowerCase(),
      classes: Array.from(current.classList).join(' '),
      id: current.id || '',
      displayName: `${current.tagName.toLowerCase()}${current.id ? '#' + current.id : ''}${current.classList.length ? '.' + Array.from(current.classList).join('.') : ''}`
    })
    current = current.parentElement
  }

  // Update hierarchy selector
  updateHierarchySelector()
}

/**
 * Updates the hierarchy selector dropdown
 */
function updateHierarchySelector () {
  const hierarchySelect = document.getElementById('ote-hierarchy-select')
  const hierarchyGroup = document.getElementById('ote-element-hierarchy')

  if (!hierarchySelect || !hierarchyGroup) return

  // Clear existing options
  hierarchySelect.innerHTML = '<option value="">Select element level...</option>'

  if (elementHierarchy.length > 1) {
    hierarchyGroup.style.display = 'block'

    elementHierarchy.forEach((item, index) => {
      const option = document.createElement('option')
      option.value = index
      option.textContent = item.displayName
      hierarchySelect.appendChild(option)
    })

    // Select the current element (last in hierarchy)
    hierarchySelect.value = elementHierarchy.length - 1
  } else {
    hierarchyGroup.style.display = 'none'
  }
}

/**
 * Stores original values for undo functionality
 * @param {HTMLElement} element The element to store values for
 */
function storeOriginalValues (element) {
  const selector = generateSelector(element)

  if (!originalValues[selector]) {
    const computedStyle = getComputedStyle(element)
    originalValues[selector] = {
      color: computedStyle.getPropertyValue('color'),
      backgroundColor: computedStyle.getPropertyValue('background-color'),
      fontSize: computedStyle.getPropertyValue('font-size'),
      padding: computedStyle.getPropertyValue('padding'),
      margin: computedStyle.getPropertyValue('margin'),
      border: computedStyle.getPropertyValue('border'),
      borderRadius: computedStyle.getPropertyValue('border-radius'),
      height: computedStyle.getPropertyValue('height'),
      width: computedStyle.getPropertyValue('width'),
      boxShadow: computedStyle.getPropertyValue('box-shadow')
    }
  }
}

/**
 * Selects element from hierarchy
 * @param {number} index Index in the hierarchy array
 */
function selectElementFromHierarchy (index) {
  if (!elementHierarchy[index]) return

  const hierarchyItem = elementHierarchy[index]
  const newElement = hierarchyItem.element

  // Remove highlight from current element
  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS)
  }

  // Set new active element
  activeElement = newElement
  activeElement.classList.add(HIGHLIGHT_CLASS)

  // Store original values
  storeOriginalValues(activeElement)

  // Update selector display
  const selectorElement = document.getElementById('ote-current-selector')
  if (selectorElement) {
    selectorElement.textContent = hierarchyItem.selector
  }

  // Repopulate toolbox
  populateToolbox(activeElement)

  debugLog('🎯 Selected element from hierarchy:', hierarchyItem.displayName)
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
    debugWarn('⚠️ No original values found for element')
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
  debugLog('🔄 Reset element to original values:', selector)
}

/**
 * Undoes the last change for current element
 */
function undoLastChange () {
  if (!activeElement) return

  const selector = generateSelector(activeElement)
  const history = currentHistory[selector]

  if (!history || Object.keys(history).length === 0) {
    debugWarn('⚠️ No changes to undo')
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

  debugLog('↶ Undid last change for:', selector, lastProperty)
}
