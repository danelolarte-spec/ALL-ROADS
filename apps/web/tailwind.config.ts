import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#5b9eff',
          500: '#357bff',
          600: '#1f5dee',
          700: '#1947cf',
          800: '#193ea1',
          900: '#1a387f',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
