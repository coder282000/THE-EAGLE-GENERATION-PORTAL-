/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#F4F5F7', 100: '#E7E9ED', 200: '#C7CBD6', 300: '#9CA3B5',
          400: '#6B7390', 500: '#4B5270', 600: '#363C56', 700: '#262B41',
          800: '#1B2135', 900: '#141B2E', 950: '#0D1220',
        },
        dawn: {
          50:  '#FDF6EC', 100: '#FBEAD1', 200: '#F5D19E', 300: '#EFB86C',
          400: '#E9A653', 500: '#E29B3D', 600: '#C67F27', 700: '#9C631E',
          800: '#734818', 900: '#4D3110',
        },
        sky: {
          50:  '#EEF2F7', 100: '#D6E0EC', 200: '#AFC2DA', 300: '#87A4C7',
          400: '#688DB8', 500: '#4A6FA5', 600: '#3B5985', 700: '#2D4465',
          800: '#1F2F47', 900: '#141E2E',
        },
        clay: {
          50:  '#FBEEEC', 100: '#F4D2CC', 200: '#E7A99C', 300: '#D77F6C',
          400: '#C6604A', 500: '#B8493D', 600: '#993B31', 700: '#7A2E27',
          800: '#5B221D', 900: '#3D1613',
        },
        paper: {
          DEFAULT:  '#F3F5F8',
          muted:    '#E7E9ED',
          elevated: '#FFFFFF',
          inverse:  '#141B2E',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted:   'var(--fg-muted)',
          subtle:  'var(--fg-subtle)',
          inverse: 'var(--fg-inverse)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover:   'var(--primary-hover)',
          fg:      'var(--primary-fg)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover:   'var(--secondary-hover)',
          fg:      'var(--secondary-fg)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg:      'var(--accent-fg)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
        info:    'var(--info)',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      spacing: {
        13: '3.25rem',
      },
      borderRadius: {
        md: '0.5rem',
      },
      boxShadow: {
        xs:    '0 1px 2px 0 rgb(13 18 32 / 0.05)',
        sm:    '0 1px 3px 0 rgb(13 18 32 / 0.10), 0 1px 2px -1px rgb(13 18 32 / 0.06)',
        md:    '0 4px 6px -1px rgb(13 18 32 / 0.10), 0 2px 4px -2px rgb(13 18 32 / 0.06)',
        lg:    '0 10px 15px -3px rgb(13 18 32 / 0.10), 0 4px 6px -4px rgb(13 18 32 / 0.05)',
        xl:    '0 20px 25px -5px rgb(13 18 32 / 0.10), 0 8px 10px -6px rgb(13 18 32 / 0.05)',
        focus: '0 0 0 2px var(--focus-ring-offset), 0 0 0 4px var(--focus-ring)',
      },
      transitionDuration: {
        fast:    '120ms',
        DEFAULT: '200ms',
        slow:    '300ms',
      },
      transitionTimingFunction: {
        'out-quad':    'cubic-bezier(0, 0, 0.2, 1)',
        'in-quad':     'cubic-bezier(0.4, 0, 1, 1)',
        'in-out-quad': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        dropdown: '10',
        sticky:   '20',
        banner:   '30',
        overlay:  '40',
        modal:    '50',
        popover:  '60',
        tooltip:  '70',
        toast:    '80',
      },
    },
  },
  plugins: [],
};
