/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'modal-fadeO': 'modalFadeOut 0.3s ease-out',
        'modal-fade': 'modalFadeIn 0.3s ease-in-out',
        'modal-slideL': 'modalSlideLeft 0.3s ease-in-out',
        'modal-slideR': 'modalSlideRight 0.3s ease-in-out',
        'modal-slideD': 'modalSlideDown 0.3s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        modalFadeOut: {
          '100%': { opacity: 1 },
          '0%': { opacity: 0 },
        },
        modalFadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        modalSlideLeft: {
          '0%': { transform: 'translateX(40px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        modalSlideRight: {
          '0%': { transform: 'translateX(-40px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        modalSlideDown: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};
