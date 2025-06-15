/**
 * Utility functions to replace common color patterns in components
 * This helps maintain consistency while migrating from hardcoded colors
 */
const colourMap = {
    red: '#D24330',
    darkRed: '#A02A1D',
    yellow: '#ECCC36',
    darkYellow: '#BFA02A',
    lightGreen: '#DFEDC3',
    green: '#309563',
    darkTeal: '#0C4038',
    white: '#FDFAF7',
    transparent: 'transparent',
    grey: '#BFC7B5',
    indigo: '#103A5D',
    darkIndigo: '#0A2A4B',
    cyan: '#3B9C87'

}

// Common component color patterns
export const colours = {
  // Card styles
  card: {
    background: colourMap.white,
    border: colourMap.darkTeal,
    shadow: 'shadow-xl',
    hover: {
      background: colourMap.lightGreen,
      shadow: 'hover:shadow-md',
    }
  },

  categories: {
    price: { 
      background: "bg-yellow-100",
      border: "border-yellow-200",
    },
    quality: {
      background: "bg-red-100",
      border: "border-red-200",
    },
    nutrition: {
      background: "bg-blue-100",
      border: "border-blue-200",
    },
    sustainability: {
      background: "bg-lime-100",
      border: "border-green-200",
    },
    brand: {
      background: "bg-purple-100",
      border: "border-purple-200",
    },
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
    border: colourMap.darkTeal,
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
    link: colourMap.darkTeal,
    linkHover: colourMap.darkTeal,
  },

  // Background styles
  background: {
    primary: colourMap.white,
    secondary: colourMap.lightGreen,
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
      border: colourMap.darkYellow,
      text: colourMap.darkTeal,
      icon: colourMap.red,
    },
    error: {
      background: colourMap.red,
      border: colourMap.darkRed,
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
    trolley: colourMap.darkTeal
  },

  // Chart colors
  chart: {
    primary: colourMap.green,
    secondary: colourMap.grey,
    grid: "zinc-50",
    text: "zinc-50",
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
    border: colourMap.darkTeal,
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
  },

  tags: {
    countries: {
      border: colourMap.darkIndigo,
      background: colourMap.indigo,
      text: colourMap.white,
    }
  },

  components: {
    productCards: {
      background: colourMap.cyan,
    },

    reviews: {
      background: colourMap.cyan,
    }
  }
};
