/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./src/pages/**/*.html",
    "./*.html"
  ],
  theme: {
    colors: {
      // Only use our custom green colors, disable Tailwind defaults
      'primary-green': '#617140',
      'dark-green': '#4a5930',
      'sage-green': '#c5ceb3',
      'pale-green': '#e6ead4',
      'light-sage': '#a4b494',
      'medium-sage': '#7a8e5a',
      'off-white': '#f5f6f2',
      'text-dark': '#242b1d',
      'white': '#ffffff',
      'gray': '#6c757d',
      'transparent': 'transparent',
      'current': 'currentColor',
    },
    extend: {
      boxShadow: {
        'sm-custom': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'md-custom': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg-custom': '0 12px 32px rgba(97, 113, 64, 0.15)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}