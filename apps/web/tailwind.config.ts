import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0058A3',
          'blue-dark': '#004f93',
          yellow: '#FFDA1A',
          red: '#E00751',
          gray: '#F5F5F0',
        },
      },
    },
  },
  plugins: [],
};
export default config;
