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
      background: colourMap.white,
      text: colourMap.darkTeal,
      border: colourMap.green,
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
    },
    edit: {
      background: colourMap.white,
      text: colourMap.darkTeal,
      hover: {
        background: colourMap.lightGreen,
      }
    }
  },

  // Input styles
  input: {
    background: colourMap.white,
    border: colourMap.grey,
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
    secondary: colourMap.darkTeal,
    tertiary: colourMap.yellow,
    muted: colourMap.grey,
    inverse: colourMap.white,
    link: colourMap.green,
    linkHover: colourMap.darkTeal,
  },

  // Background styles
  background: {
    primary: colourMap.white,
    secondary: colourMap.white,
    tertiary: colourMap.white,
    muted: colourMap.white,
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
    border: colourMap.grey,
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
      background: colourMap.white,
      text: colourMap.green,
    }
  },

  // Content areas
  content: {
    surface: colourMap.white,
    surfaceSecondary: colourMap.white,
    border: colourMap.grey,
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

  bargraph: {
    background: colourMap.white,
    price: {
      background: colourMap.green,
      border: colourMap.green,
    },
    quality: {
      background: colourMap.green,
      border: colourMap.green,
    },
    nutrition: {
      background: colourMap.green,
      border: colourMap.green,
    },
    sustainability: {
      background: colourMap.green,
      border: colourMap.green,
    },
    brand: {
      background: colourMap.green,
      border: colourMap.green,
    },
  }
};
