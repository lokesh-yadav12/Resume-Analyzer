// Accessibility utilities and helpers

/**
 * Generate unique IDs for form elements and ARIA attributes
 */
let idCounter = 0;
export const generateId = (prefix = 'id') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element) => {
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    window.getComputedStyle(element).visibility !== 'hidden' &&
    window.getComputedStyle(element).display !== 'none'
  );
};

/**
 * Get accessible label for an element
 */
export const getAccessibleLabel = (element) => {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    element.getAttribute('title') ||
    element.getAttribute('placeholder')
  );
};

/**
 * Keyboard navigation helpers
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
};

/**
 * Check if keyboard event matches key
 */
export const isKey = (event, key) => {
  return event.key === key || event.code === key;
};

/**
 * Prevent default and stop propagation
 */
export const preventDefaultAndStopPropagation = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  // Store the last focused element before opening modal/dialog
  storeFocus: () => {
    return document.activeElement;
  },
  
  // Restore focus to previously focused element
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },
  
  // Focus first error in form
  focusFirstError: (formElement) => {
    const firstError = formElement.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.focus();
    }
  },
};

/**
 * ARIA attribute helpers
 */
export const ariaHelpers = {
  // Set expanded state
  setExpanded: (element, isExpanded) => {
    element.setAttribute('aria-expanded', isExpanded.toString());
  },
  
  // Set selected state
  setSelected: (element, isSelected) => {
    element.setAttribute('aria-selected', isSelected.toString());
  },
  
  // Set checked state
  setChecked: (element, isChecked) => {
    element.setAttribute('aria-checked', isChecked.toString());
  },
  
  // Set disabled state
  setDisabled: (element, isDisabled) => {
    if (isDisabled) {
      element.setAttribute('aria-disabled', 'true');
      element.setAttribute('disabled', '');
    } else {
      element.removeAttribute('aria-disabled');
      element.removeAttribute('disabled');
    }
  },
  
  // Set invalid state
  setInvalid: (element, isInvalid, errorId) => {
    if (isInvalid) {
      element.setAttribute('aria-invalid', 'true');
      if (errorId) {
        element.setAttribute('aria-describedby', errorId);
      }
    } else {
      element.removeAttribute('aria-invalid');
      element.removeAttribute('aria-describedby');
    }
  },
};

/**
 * Color contrast checker (WCAG AA compliance)
 */
export const checkColorContrast = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: ratio.toFixed(2),
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
  };
};

/**
 * Skip to content link helper
 */
export const createSkipLink = (targetId, text = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg';
  skipLink.textContent = text;
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  return skipLink;
};

/**
 * Reduced motion preference check
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * High contrast mode check
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Screen reader only CSS class
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Add screen reader only styles to document
 */
export const addScreenReaderStyles = () => {
  if (document.getElementById('sr-only-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'sr-only-styles';
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    .sr-only-focusable:focus,
    .sr-only-focusable:active {
      position: static;
      width: auto;
      height: auto;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;
  
  document.head.appendChild(style);
};

// Initialize screen reader styles
if (typeof document !== 'undefined') {
  addScreenReaderStyles();
}

export default {
  generateId,
  trapFocus,
  announceToScreenReader,
  isVisibleToScreenReader,
  getAccessibleLabel,
  KEYS,
  isKey,
  preventDefaultAndStopPropagation,
  focusManagement,
  ariaHelpers,
  checkColorContrast,
  createSkipLink,
  prefersReducedMotion,
  prefersHighContrast,
  SR_ONLY_CLASS,
};
