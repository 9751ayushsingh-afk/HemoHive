
import type { Config } from 'tailwindcss'

const config: Config = {
  future: {
    // @ts-ignore
    disableOklabColorSpace: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'donor-background-light': '#FAFAF9',
        'hemohive-red': '#B00020',
        'hemohive-red-light': '#FFCDD2',
        'accent-teal': '#0D9488',
        'bg-dark': '#0B1220',
        'muted': '#94A3B8',
        'success': '#10B981',
        'danger': '#EF4444',
      },
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
      },
      transitionDuration: {
        fast: '120ms',
        medium: '280ms',
        slow: '600ms',
      },
      transitionTimingFunction: {
        easing: 'cubic-bezier(.22,.9,.36,1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
