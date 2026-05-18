import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          50: 'rgb(var(--cyber-50) / <alpha-value>)',
          100: 'rgb(var(--cyber-100) / <alpha-value>)',
          200: 'rgb(var(--cyber-200) / <alpha-value>)',
          300: 'rgb(var(--cyber-300) / <alpha-value>)',
          400: 'rgb(var(--cyber-400) / <alpha-value>)',
          500: 'rgb(var(--cyber-500) / <alpha-value>)',
          600: 'rgb(var(--cyber-600) / <alpha-value>)',
          700: 'rgb(var(--cyber-700) / <alpha-value>)',
          800: 'rgb(var(--cyber-800) / <alpha-value>)',
          900: 'rgb(var(--cyber-900) / <alpha-value>)',
          950: 'rgb(var(--cyber-950) / <alpha-value>)',
        },
        neon: {
          50: 'rgb(var(--neon-50) / <alpha-value>)',
          100: 'rgb(var(--neon-100) / <alpha-value>)',
          200: 'rgb(var(--neon-200) / <alpha-value>)',
          300: 'rgb(var(--neon-300) / <alpha-value>)',
          400: 'rgb(var(--neon-400) / <alpha-value>)',
          500: 'rgb(var(--neon-500) / <alpha-value>)',
          600: 'rgb(var(--neon-600) / <alpha-value>)',
          700: 'rgb(var(--neon-700) / <alpha-value>)',
          800: 'rgb(var(--neon-800) / <alpha-value>)',
          900: 'rgb(var(--neon-900) / <alpha-value>)',
          950: 'rgb(var(--neon-950) / <alpha-value>)',
        },
        void: {
          50: 'rgb(var(--void-50) / <alpha-value>)',
          100: 'rgb(var(--void-100) / <alpha-value>)',
          200: 'rgb(var(--void-200) / <alpha-value>)',
          300: 'rgb(var(--void-300) / <alpha-value>)',
          400: 'rgb(var(--void-400) / <alpha-value>)',
          500: 'rgb(var(--void-500) / <alpha-value>)',
          600: 'rgb(var(--void-600) / <alpha-value>)',
          700: 'rgb(var(--void-700) / <alpha-value>)',
          800: 'rgb(var(--void-800) / <alpha-value>)',
          900: 'rgb(var(--void-900) / <alpha-value>)',
          950: 'rgb(var(--void-950) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans SC"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
        'scan-line': 'scanLine 8s linear infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,229,255,0.2), 0 0 20px rgba(0,229,255,0.05)' },
          '50%': { boxShadow: '0 0 15px rgba(0,229,255,0.4), 0 0 40px rgba(0,229,255,0.15)' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgb(var(--cyber-400) / 0.15)' },
          '50%': { borderColor: 'rgb(var(--cyber-400) / 0.45)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgb(var(--cyber-400) / 0.15), 0 0 40px rgb(var(--cyber-400) / 0.05)',
        'glow-cyan-sm': '0 0 8px rgb(var(--cyber-400) / 0.12)',
        'glow-purple': '0 0 15px rgb(var(--neon-400) / 0.15), 0 0 40px rgb(var(--neon-400) / 0.05)',
        'glow-card': '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.06)',
        'glow-card-hover': '0 1px 3px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
