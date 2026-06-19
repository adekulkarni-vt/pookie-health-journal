import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FFD4E5',
        'pastel-blue': '#D4E5FF',
        'pastel-purple': '#E5D4FF',
        'pastel-green': '#D4FFE5',
        'pastel-yellow': '#FFEDD4',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
