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
        hearth: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        ember: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        night: {
          800: '#1e1b18',
          850: '#171412',
          900: '#12100e',
          950: '#0c0a09',
        }
      },
      animation: {
        'flame-flicker': 'flicker 3s infinite alternate ease-in-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float-embers': 'floatEmbers 4s infinite linear',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 0.95, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(0.98)' },
          '75%': { opacity: 1, transform: 'scale(1.02)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.6))' },
        },
        floatEmbers: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 0.8 },
          '100%': { transform: 'translateY(-60px) scale(0.3)', opacity: 0 },
        },
      }
    },
  },
  plugins: [],
}
