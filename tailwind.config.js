module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateZ(0)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateZ(0)'
          },
        },
        'slide-in-bottom': {
          '0%': { 
            transform: 'translate3d(0, 8px, 0)', 
            opacity: '0'
          },
          '100%': { 
            transform: 'translate3d(0, 0, 0)', 
            opacity: '1'
          },
        },
        'slide-in-left': {
          '0%': { 
            transform: 'translate3d(-8px, 0, 0)', 
            opacity: '0'
          },
          '100%': { 
            transform: 'translate3d(0, 0, 0)', 
            opacity: '1'
          },
        },
        'slide-in-right': {
          '0%': { 
            transform: 'translate3d(8px, 0, 0)', 
            opacity: '0'
          },
          '100%': { 
            transform: 'translate3d(0, 0, 0)', 
            opacity: '1'
          },
        },
        'scale-in': {
          '0%': { 
            transform: 'scale3d(0.98, 0.98, 1)', 
            opacity: '0'
          },
          '100%': { 
            transform: 'scale3d(1, 1, 1)', 
            opacity: '1'
          },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-bottom': 'slide-in-bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      willChange: {
        'animation': 'transform, opacity',
      },
      utilities: {
        '.animate-ready': {
          'will-change': 'transform, opacity',
          'backface-visibility': 'hidden',
          'transform': 'translateZ(0)',
        },
      },
    },
  },
  plugins: [],
};