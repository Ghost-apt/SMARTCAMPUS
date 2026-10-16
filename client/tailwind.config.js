/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Futuristic Midnight Palette
          darkBg: '#080B16',
          darkBgSecondary: '#0D1224',
          darkSurface: '#121A2E',
          darkCard: '#18233B',
          darkBorder: '#232D48',
          // Primary Accent: Electric Blue
          primary: '#6C8CFF',
          primaryHover: '#5575F5',
          primaryLight: '#8FA8FF',
          // Cyan Accent: Neon Cyan
          accent: '#43D9FF',
          accentLight: '#6CE1FF',
          cyan: '#43D9FF',
          // AI Violet Accent: Soft AI Violet
          aiViolet: '#A78BFA',
          violet: '#A78BFA',
          secondary: '#A78BFA',
          secondaryHover: '#9065F7',
          // Text Tokens
          textMain: '#F3F6FF',
          textSecondary: '#9BA8C7',
          textMuted: '#687799',
          // Light Surfaces (for Light Mode)
          lightBg: '#F8FAFC',
          lightSurface: '#FFFFFF',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
          // Status Tokens
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
          // Legacy aliases for backward compatibility
          navy: '#080B16',
          indigo: '#6C8CFF',
          indigoHover: '#5575F5',
          teal: '#43D9FF',
          tealLight: '#6CE1FF',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0'
        }
      },
      boxShadow: {
        'glow-blue': '0 0 30px -4px rgba(108, 140, 255, 0.35)',
        'glow-cyan': '0 0 30px -4px rgba(67, 217, 255, 0.35)',
        'glow-violet': '0 0 30px -4px rgba(167, 139, 250, 0.35)',
        'glow-indigo': '0 0 25px -4px rgba(108, 140, 255, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'card-elevated': '0 12px 40px -10px rgba(0, 0, 0, 0.6)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 15s ease infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }
    },
  },
  plugins: [],
}
