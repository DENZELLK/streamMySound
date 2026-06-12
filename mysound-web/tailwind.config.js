/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Modern gradient colors for music app
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Dark theme colors
        dark: {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#525252',
          500: '#666666',
          600: '#7a7a7a',
          700: '#8f8f8f',
          800: '#a3a3a3',
          900: '#b8b8b8',
        },
        // Glass morphism colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.4)',
          purple: 'rgba(139, 92, 246, 0.1)',
          pink: 'rgba(236, 72, 153, 0.1)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'music-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'purple-pink': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'dark-gradient': 'linear-gradient(135deg, #000000 0%, #1a0b2e 50%, #2d1b69 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)',
      },
      animation: {
        // Custom animations for music app
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'slide-left': 'slideLeft 0.6s ease-out',
        'slide-right': 'slideRight 0.6s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'progress': 'progress 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' },
        },
        wave: {
          '0%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
          '100%': { transform: 'scaleY(0.5)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backdropBrightness: {
        25: '.25',
      },
      backdropContrast: {
        25: '.25',
      },
      backdropGrayscale: {
        50: '.5',
      },
      backdropHueRotate: {
        60: '60deg',
      },
      backdropInvert: {
        25: '.25',
      },
      backdropOpacity: {
        15: '0.15',
        35: '0.35',
        65: '0.65',
        85: '0.85',
      },
      backdropSaturate: {
        30: '.3',
      },
      backdropSepia: {
        25: '.25',
      },
      // Custom spacing for music app layout
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Custom box shadow for depth
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 5px theme(colors.primary.500), 0 0 20px theme(colors.primary.500)',
        'neon-pink': '0 0 5px theme(colors.secondary.500), 0 0 20px theme(colors.secondary.500)',
      },
      // Custom font sizes
      fontSize: {
        'xxs': '0.625rem',
        '10xl': '10rem',
      },
      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Custom min/max dimensions
      minHeight: {
        'screen-75': '75vh',
      },
      maxHeight: {
        'screen-90': '90vh',
      },
      // Custom transition properties
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
      },
      // Custom transition timing functions
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Custom grid templates
      gridTemplateColumns: {
        'auto-fill-100': 'repeat(auto-fill, minmax(100px, 1fr))',
        'auto-fill-150': 'repeat(auto-fill, minmax(150px, 1fr))',
        'auto-fill-200': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
    },
  },
  plugins: [
    // Custom plugin for backdrop filters
    function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-glass': {
          backdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '.backdrop-glass-dark': {
          backdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-default': {
          '-ms-overflow-style': 'auto',
          'scrollbar-width': 'auto',
          '&::-webkit-scrollbar': {
            display: 'block',
          },
        },
        '.music-card': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.progress-bar': {
          appearance: 'none',
          height: '6px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.2)',
          outline: 'none',
          cursor: 'pointer',
        },
      }
      addUtilities(newUtilities)
    },
    // Plugin for custom forms (range inputs)
    function({ addBase, theme }) {
      addBase({
        'input[type="range"]::-webkit-slider-thumb': {
          appearance: 'none',
          height: theme('spacing.4'),
          width: theme('spacing.4'),
          borderRadius: theme('borderRadius.full'),
          background: theme('colors.primary.500'),
          cursor: 'pointer',
          border: `2px solid ${theme('colors.white')}`,
          boxShadow: theme('boxShadow.md'),
        },
        'input[type="range"]::-moz-range-thumb': {
          height: theme('spacing.4'),
          width: theme('spacing.4'),
          borderRadius: theme('borderRadius.full'),
          background: theme('colors.primary.500'),
          cursor: 'pointer',
          border: `2px solid ${theme('colors.white')}`,
          boxShadow: theme('boxShadow.md'),
          border: 'none',
        },
      })
    },
  ],
}