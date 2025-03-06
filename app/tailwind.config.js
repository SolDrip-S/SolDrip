/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'solana-green': '#14F195',
        'solana-purple': '#9945FF',
        'soldrip-primary': '#3B82F6',
        'soldrip-secondary': '#10B981',
        'soldrip-accent': '#F59E0B',
        'soldrip-dark': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'drip': 'drip 2s ease-in-out infinite',
      },
      keyframes: {
        drip: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
}; 