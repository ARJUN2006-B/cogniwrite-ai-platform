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
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#6366f1', // Refined editorial indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          light: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
          borderLight: '#e2e8f0',
          dark: '#0b0f17',       // Deep ink
          darkCard: '#111726',   // Sophisticated elevated dark
          darkMuted: '#1a2234',  // Subtle dark fill
          borderDark: '#222d42', // Restrained border
        },
        ink: {
          primary: '#0f172a',
          secondary: '#475569',
          tertiary: '#94a3b8',
          darkPrimary: '#f8fafc',
          darkSecondary: '#cbd5e1',
          darkTertiary: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        editorial: ['Newsreader', 'Charter', 'Georgia', 'serif'],
      },
      maxWidth: {
        prose: '72ch', // Ideal editorial reading width
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
        'floating': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'glow-brand': '0 0 20px -3px rgba(79, 70, 229, 0.25)',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-in': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
