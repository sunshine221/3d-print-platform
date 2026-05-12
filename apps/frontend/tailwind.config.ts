import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        accent: '#ff4d4f',
      },
    },
  },
  plugins: [],
};
export default config;
