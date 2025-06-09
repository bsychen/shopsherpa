module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-bottom': {
          'from': { 
            transform: 'translateY(10px)', 
            opacity: '0' 
          },
          'to': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-bottom': 'slide-in-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
    },
  },
  plugins: [],
};