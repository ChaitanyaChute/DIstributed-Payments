/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        slate: {
          750: '#232d3f',
          800: '#1a2232',
          850: '#131926',
          900: '#0d131f',
          925: '#080d16',
          950: '#05080f',
        },
      },
      boxShadow: {
        card: '0 0 0 1px rgb(15 23 42 / 0.06), 0 1px 2px 0 rgb(15 23 42 / 0.04)',
        'card-hover': '0 0 0 1px rgb(15 23 42 / 0.12), 0 12px 28px -6px rgb(15 23 42 / 0.08)',
        soft: '0 20px 40px -15px rgb(0 0 0 / 0.07), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        glow: '0 0 24px -4px rgb(16 185 129 / 0.25)',
        'glow-emerald': '0 0 24px -4px rgb(16 185 129 / 0.4)',
        'glow-white': '0 0 24px -2px rgb(255 255 255 / 0.25)',
        'inner-light': 'inset 0 1px 0 0 rgb(255 255 255 / 0.12)',
        'inner-dark': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.35)',
        'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 12px 30px -10px rgba(0, 0, 0, 0.4)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'dot-grid':
          'radial-gradient(circle, rgb(15 23 42 / 0.06) 1px, transparent 1px)',
        'dot-grid-dark':
          'radial-gradient(circle, rgb(255 255 255 / 0.07) 1px, transparent 1px)',
        'fintech-mesh':
          'radial-gradient(at 0% 0%, rgb(16 185 129 / 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(15 23 42 / 0.05) 0px, transparent 50%)',
        'fintech-mesh-dark':
          'radial-gradient(at 0% 0%, rgb(16 185 129 / 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(14 165 233 / 0.1) 0px, transparent 50%)',
        'card-gradient':
          'linear-gradient(135deg, #0f1623 0%, #080c14 100%)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px',
      },
    },
  },
  plugins: [],
};
