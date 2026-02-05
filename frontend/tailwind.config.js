/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Rwanda Government-inspired palette: Primary Blue (calm, official)
        primary: {
          50: '#f0f6fc',
          100: '#dceaf8',
          200: '#bfd9f2',
          300: '#92c2e9',
          400: '#5fa3dd',
          500: '#3d87ce',
          600: '#2d6cb4',
          700: '#255793',
          800: '#234a78',
          900: '#213f64',
          950: '#162842',
        },
        // Neutral grays for text hierarchy (RISA guidelines)
        gov: {
          black: '#1a1a1a',      // Display/heading
          black2: '#4a4a4a',     // Body text
          black3: '#6b6b6b',     // Subheading
          gray: '#8c8c8c',       // Labels, borders
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '90rem',
        '9xl': '100rem',
      },
    },
  },
  plugins: [],
}
