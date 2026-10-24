/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#D9799E',
          deepRose: '#B9577E',
          palePink: '#FFF0F5',
          blush: '#FFFAFC',
          text: '#3D2933',
          secondary: '#957E88',
          border: '#F1DFE7',
          success: '#2E7D32',
          warning: '#ED6C02',
          error: '#D32F2F',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 2px 10px rgba(217, 121, 158, 0.08)',
        card: '0 4px 20px rgba(61, 41, 51, 0.06)',
        elevated: '0 10px 30px rgba(185, 87, 126, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
