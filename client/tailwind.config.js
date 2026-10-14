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
          navy: '#0f172a',
          indigo: '#4f46e5',
          indigoHover: '#4338ca',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          textMain: '#1e293b',
          textMuted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}

