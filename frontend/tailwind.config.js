/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        botanical: {
          ivory: '#F5F2EA',
          card: '#FFFEFA',
          'card-hover': '#F7F4EB',
          forest: '#243D32',
          'forest-surface': '#2E4D40',
          'forest-dark': '#1A2821',
          terracotta: '#B96F52',
          'terracotta-dark': '#9A5840',
          'terracotta-light': '#D08264',
          sage: '#84977A',
          'sage-light': '#8FA385',
          charcoal: '#292D29',
          'charcoal-dark': '#141C17',
          'card-dark': '#1D2A23',
          'card-dark-hover': '#23322B',
          muted: '#72776E',
          'muted-light': '#9FA59A',
          border: '#DED9CC',
          'border-dark': '#2E3E34',
          amber: '#B68A3A',
          'amber-light': '#D4A853',
          plum: '#5C3D4E',
          'plum-light': '#8A6075',
          'warm-gray': '#9E9B90',
        },
        // Backward-compatible semantic mappings to botanical palette
        navy: {
          950: '#F5F2EA',
          900: '#FFFEFA',
          800: '#F7F4EB',
          700: '#DED9CC',
          600: '#C8C2B3',
        },
        slate: {
          100: '#292D29',
          200: '#383D38',
          300: '#4D534C',
          400: '#72776E',
          500: '#8E938A',
          600: '#9E9B90',
          700: '#DED9CC',
        },
        teal: {
          300: '#B96F52',
          400: '#B96F52',
          500: '#243D32',
          600: '#1C3228',
        },
        cyan: {
          400: '#84977A',
          500: '#6E8264',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(3px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
