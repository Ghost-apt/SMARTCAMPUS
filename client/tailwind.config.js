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
          // Primary: Electric Indigo
          primary: '#6366f1',
          primaryHover: '#4f46e5',
          primaryLight: '#818cf8',
          // Secondary: Vibrant Violet
          secondary: '#8b5cf6',
          secondaryHover: '#7c3aed',
          // Accent: Cyan
          accent: '#06b6d4',
          accentLight: '#22d3ee',
          // Dark Surfaces
          darkBg: '#0b1020',
          darkSurface: '#111827',
          darkCard: '#1a2234',
          darkBorder: '#232d42',
          // Light Surfaces
          lightBg: '#f8fafc',
          lightSurface: '#ffffff',
          lightCard: '#ffffff',
          lightBorder: '#e2e8f0',
          // Status
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#f43f5e',
          // Legacy aliases for backward compatibility
          navy: '#0b1020',
          indigo: '#6366f1',
          indigoHover: '#4f46e5',
          teal: '#06b6d4',
          tealLight: '#22d3ee',
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          textMain: '#0f172a',
          textMuted: '#64748b'
        }
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
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
        }
      }
    },
  },
  plugins: [],
}
