/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        'modal-fade': 'modalFadeIn 0.3s ease-in-out',
        'modal-slide': 'modalSlideIn 0.3s ease-in-out',
      },
      keyframes: {
        modalFadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        modalSlideIn: {
          '0%': { transform: 'translateY(-50px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      }
    },
  },
  plugins: [],
};
