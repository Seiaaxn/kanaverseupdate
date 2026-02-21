/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#c4b9fd', 200: '#a899fc', 300: '#9080fb', 400: '#7c6dfa', 500: '#6455e8',
        },
        accent: {
          pink: '#fa6d9a', green: '#6dfabc', gold: '#fac96d', blue: '#6daefa',
        },
        dark: {
          bg: '#070711', card: '#12121f', surface: '#0e0e1a', border: '#1e1e30'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        popIn: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      }
    },
  },
  plugins: [],
}
