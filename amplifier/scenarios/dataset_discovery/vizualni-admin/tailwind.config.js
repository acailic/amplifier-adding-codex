/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Serbian brand colors from design tokens
        serbia: {
          red: {
            50: 'var(--color-serbia-red-50)',
            100: 'var(--color-serbia-red-100)',
            200: 'var(--color-serbia-red-200)',
            300: 'var(--color-serbia-red-300)',
            400: 'var(--color-serbia-red-400)',
            500: 'var(--color-serbia-red-500)',
            600: 'var(--color-serbia-red-600)',
            700: 'var(--color-serbia-red-700)',
            800: 'var(--color-serbia-red-800)',
            900: 'var(--color-serbia-red-900)',
            DEFAULT: 'var(--color-serbia-red-600)',
          },
          blue: {
            50: 'var(--color-serbia-blue-50)',
            100: 'var(--color-serbia-blue-100)',
            200: 'var(--color-serbia-blue-200)',
            300: 'var(--color-serbia-blue-300)',
            400: 'var(--color-serbia-blue-400)',
            500: 'var(--color-serbia-blue-500)',
            600: 'var(--color-serbia-blue-600)',
            700: 'var(--color-serbia-blue-700)',
            800: 'var(--color-serbia-blue-800)',
            900: 'var(--color-serbia-blue-900)',
            DEFAULT: 'var(--color-serbia-blue-600)',
          },
          green: {
            50: 'var(--color-serbia-green-50)',
            100: 'var(--color-serbia-green-100)',
            200: 'var(--color-serbia-green-200)',
            300: 'var(--color-serbia-green-300)',
            400: 'var(--color-serbia-green-400)',
            500: 'var(--color-serbia-green-500)',
            600: 'var(--color-serbia-green-600)',
            700: 'var(--color-serbia-green-700)',
            800: 'var(--color-serbia-green-800)',
            900: 'var(--color-serbia-green-900)',
            DEFAULT: 'var(--color-serbia-green-500)',
          },
          white: 'var(--color-neutral-0)',
          primary: 'var(--color-serbia-red-600)',
          secondary: 'var(--color-serbia-blue-600)',
          accent: 'var(--color-serbia-green-500)',
        },
        // Semantic colors from design tokens
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          DEFAULT: 'var(--color-success-600)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          DEFAULT: 'var(--color-warning-600)',
        },
        error: {
          50: 'var(--color-error-50)',
          100: 'var(--color-error-100)',
          500: 'var(--color-error-500)',
          600: 'var(--color-error-600)',
          700: 'var(--color-error-700)',
          DEFAULT: 'var(--color-error-600)',
        },
        info: {
          50: 'var(--color-info-50)',
          100: 'var(--color-info-100)',
          500: 'var(--color-info-500)',
          600: 'var(--color-info-600)',
          700: 'var(--color-info-700)',
          DEFAULT: 'var(--color-info-600)',
        },
      },
      // Enhanced spacing from design tokens
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
        144: '36rem',
      },
      // Enhanced typography from design tokens
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        serif: ['var(--font-family-serif)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        '2xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-tight)' }],
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-normal)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-tight)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
        '5xl': ['2.5rem', { lineHeight: 'var(--line-height-tight)' }],
        '6xl': ['3rem', { lineHeight: 'var(--line-height-tight)' }],
      },
      fontWeight: {
        thin: 'var(--font-weight-thin)',
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
        black: 'var(--font-weight-black)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)',
      },
      borderRadius: {
        '4xl': 'var(--radius-2xl)',
        '5xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        'serbia': 'var(--shadow-serbia)',
        'serbia-blue': 'var(--shadow-serbia-blue)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-bounce',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-bounce',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'spring': 'var(--ease-spring)',
        'smooth': 'var(--ease-smooth)',
        'bounce': 'var(--ease-bounce)',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Add component utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.transition-all-300': {
          transition: 'all 300ms var(--ease-smooth)',
        },
        '.transition-transform-300': {
          transition: 'transform 300ms var(--ease-spring)',
        },
        '.transition-colors-200': {
          transition: 'color 200ms var(--ease-out), background-color 200ms var(--ease-out), border-color 200ms var(--ease-out)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}