/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:     'var(--bg)',
        s1:     'var(--s1)',
        s2:     'var(--s2)',
        s3:     'var(--s3)',
        border: 'var(--border)',
        'text-pri': 'var(--t-pri)',
        'text-sec': 'var(--t-sec)',
        'text-dim': 'var(--t-dim)',

        // Section type colors
        'sec-intro':  '#5A6470',
        'sec-verse':  '#2A7A5A',
        'sec-pre':    '#2A5A9A',
        'sec-chorus': '#9A3030',
        'sec-post':   '#6A2020',
        'sec-bridge': '#6A2A8A',
        'sec-solo':   '#8A6A1A',
        'sec-break':  '#8A4A1A',
        'sec-build':  '#7A5A1A',
        'sec-outro':  '#4A5058',
        'sec-custom': '#4A5058',

        // Event colors
        'ev-cut':    '#E05555',
        'ev-stop':   '#E08844',
        'ev-hit':    '#D4AA40',
        'ev-repeat': '#4A8ACA',
        'ev-muted':  '#7A8088',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px
      },
      spacing: {
        touch: '44px', // minimum touch target
        safe:  'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
