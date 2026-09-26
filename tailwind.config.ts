import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 950: '#07110c', 900: '#0b1a13', 800: '#10261b', 700: '#17382a' },
        moss: '#2f6b4f',
        sage: '#8fb9a0',
        gold: { DEFAULT: '#d9b76a', light: '#f0d9a0' },
        cream: '#f4efe2',
        ember: '#e07a3f',
      },
      fontFamily: {
        sans: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(217,183,106,0.45)',
        glass: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        kenburns: { '0%': { transform: 'scale(1.05) translate(0,0)' }, '100%': { transform: 'scale(1.18) translate(-2%,-1.5%)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        kenburns: 'kenburns 24s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
export default config;
