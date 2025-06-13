/**
 * Utility functions to replace common color patterns in components
 * This helps maintain consistency while migrating from hardcoded colors
 */
const colourMap = {
    red: '#D24330',
    yellow: '#ECCC36',
    lightGreen: '#EBF6B7',
    green: '#309563',
    darkTeal: '#0C4038',
    white: '#FFFFFF',
    transparent: 'transparent',
    grey: 'zinc-50',
}

// Common component color patterns
export const colours = {
  // Card styles
  card: {
    background: colourMap.white,
    border: colourMap.grey,
    shadow: 'shadow',
    hover: {
      background: colourMap.lightGreen,
      shadow: 'hover:shadow-md',
    }
  },

  // Button styles
  button: {
    primary: {
      background: colourMap.green,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
      }
    },
    secondary: {
      background: colourMap.lightGreen,
      text: colourMap.darkTeal,
      hover: {
        background: colourMap.yellow,
      }
    },
    success: {
      background: colourMap.green,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
      }
    },
    danger: {
      background: colourMap.red,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
      }
    },
    ghost: {
      background: colourMap.transparent,
      text: colourMap.darkTeal,
      hover: {
        background: colourMap.lightGreen,
      }
    }
  },

  // Input styles
  input: {
    background: colourMap.white,
    border: colourMap.lightGreen,
    text: colourMap.darkTeal,
    placeholder: colourMap.green,
    focus: {
      ring: `2px solid ${colourMap.green}`,
      border: colourMap.green,
    }
  },

  // Text styles
  text: {
    primary: colourMap.darkTeal,
    secondary: colourMap.green,
    tertiary: colourMap.yellow,
    muted: colourMap.grey,
    inverse: colourMap.white,
    link: colourMap.green,
    linkHover: colourMap.darkTeal,
  },

  // Background styles
  background: {
    primary: colourMap.white,
    secondary: colourMap.lightGreen,
    tertiary: colourMap.yellow,
    muted: colourMap.lightGreen,
  },

  // Status colors
  status: {
    success: {
      background: colourMap.lightGreen,
      border: colourMap.green,
      text: colourMap.darkTeal,
      icon: colourMap.green,
    },
    warning: {
      background: colourMap.yellow,
      border: colourMap.red,
      text: colourMap.darkTeal,
      icon: colourMap.red,
    },
    error: {
      background: colourMap.red,
      border: colourMap.darkTeal,
      text: colourMap.white,
      icon: colourMap.white,
    },
    info: {
      background: colourMap.lightGreen,
      border: colourMap.green,
      text: colourMap.darkTeal,
      icon: colourMap.green,
    }
  },

  // Tag styles
  tag: {
    default: {
      background: colourMap.lightGreen,
      border: colourMap.green,
      text: colourMap.darkTeal,
      hover: {
        background: colourMap.yellow,
        text: colourMap.darkTeal,
      }
    },
    primary: {
      background: colourMap.green,
      border: colourMap.darkTeal,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
        text: colourMap.white,
      }
    },
    success: {
      background: colourMap.green,
      border: colourMap.darkTeal,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
        text: colourMap.white,
      }
    },
    warning: {
      background: colourMap.yellow,
      border: colourMap.red,
      text: colourMap.darkTeal,
      hover: {
        background: colourMap.red,
        text: colourMap.white,
      }
    },
    error: {
      background: colourMap.red,
      border: colourMap.darkTeal,
      text: colourMap.white,
      hover: {
        background: colourMap.darkTeal,
        text: colourMap.white,
      }
    }
  },

  // Loading spinner
  spinner: {
    border: colourMap.lightGreen,
    borderTop: colourMap.green,
    text: colourMap.green,
  },

  // Chart colors
  chart: {
    primary: colourMap.green,
    secondary: colourMap.lightGreen,
    grid: colourMap.lightGreen,
    text: colourMap.darkTeal,
  },

  // Interactive elements
  interactive: {
    selected: {
      background: colourMap.lightGreen,
      text: colourMap.darkTeal,
    },
    hover: {
      background: colourMap.lightGreen,
    },
    disabled: {
      background: colourMap.lightGreen,
      text: colourMap.green,
    }
  },

  // Content areas
  content: {
    surface: colourMap.white,
    surfaceSecondary: colourMap.lightGreen,
    border: colourMap.lightGreen,
    borderSecondary: colourMap.green,
  },

  // Score/rating colors
  score: {
    high: colourMap.green,
    medium: colourMap.yellow,
    low: colourMap.red,
  },

  // General UI elements
  ui: {
    neutral: {
      background: colourMap.lightGreen,
      backgroundSecondary: colourMap.white,
      text: colourMap.darkTeal,
      textSecondary: colourMap.green,
      border: colourMap.green,
    }
  },

  // Component-specific mappings for easy migration
  components: {
    // For zinc/gray replacements
    zinc: {
      50: colourMap.lightGreen,
      100: colourMap.lightGreen,
      200: colourMap.green,
      300: colourMap.green,
      500: colourMap.darkTeal,
      700: colourMap.darkTeal,
      800: colourMap.darkTeal,
      900: colourMap.darkTeal,
    },
    // For blue replacements  
    blue: {
      50: colourMap.lightGreen,
      100: colourMap.lightGreen,
      200: colourMap.green,
      300: colourMap.green,
      500: colourMap.green,
      600: colourMap.green,
      700: colourMap.darkTeal,
      800: colourMap.darkTeal,
    },
    // For red replacements
    red: {
      50: colourMap.lightGreen,
      100: colourMap.lightGreen,
      200: colourMap.red,
      300: colourMap.red,
      600: colourMap.red,
      700: colourMap.red,
      800: colourMap.red,
      900: colourMap.red,
    },
    // For green replacements
    green: {
      50: colourMap.lightGreen,
      100: colourMap.lightGreen,
      200: colourMap.green,
      400: colourMap.green,
      500: colourMap.green,
      600: colourMap.green,
      700: colourMap.darkTeal,
    },
    // For gray replacements
    gray: {
      50: colourMap.lightGreen,
      100: colourMap.lightGreen,
      200: colourMap.green,
      300: colourMap.green,
      600: colourMap.darkTeal,
      700: colourMap.darkTeal,
    }
  }
};
