import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBFAF7',
        ivory: '#F5F1EA',
        sakura: '#F4E2E4',
        moss: '#8FA58A',
        ink: '#3A3733',
        muted: '#7A756F'
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 2px 20px -8px rgba(58, 55, 51, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
