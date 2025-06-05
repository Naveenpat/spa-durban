/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--lt-palette-primary40)',
          10: 'var(--lt-palette-primary10)',
          20: 'var(--lt-palette-primary20)',
          30: 'var(--lt-palette-primary30)',
          40: 'var(--lt-palette-primary40)',
          50: 'var(--lt-palette-primary50)',
          60: 'var(--lt-palette-primary60)',
          70: 'var(--lt-palette-primary70)',
          80: 'var(--lt-palette-primary80)',
          90: 'var(--lt-palette-primary90)',
          95: 'var(--lt-palette-primary95)',
          98: 'var(--lt-palette-primary98)',
          99: 'var(--lt-palette-primary99)',
          container: 'var(--lt-palette-primary90)',
          onContainer: 'var(--lt-palette-primary30)',
        },
        secondary: {
          DEFAULT: 'var(--lt-palette-secondary40)',
          10: 'var(--lt-palette-secondary10)',
          20: 'var(--lt-palette-secondary20)',
          30: 'var(--lt-palette-secondary30)',
          40: 'var(--lt-palette-secondary40)',
          50: 'var(--lt-palette-secondary50)',
          60: 'var(--lt-palette-secondary60)',
          70: 'var(--lt-palette-secondary70)',
          80: 'var(--lt-palette-secondary80)',
          90: 'var(--lt-palette-secondary90)',
          95: 'var(--lt-palette-secondary95)',
          98: 'var(--lt-palette-secondary98)',
          99: 'var(--lt-palette-secondary99)',
          container: 'var(--lt-palette-secondary90)',
          onContainer: 'var(--lt-palette-secondary30)',
        },
        tertiary: {
          DEFAULT: 'var(--lt-palette-tertiary40)',
          10: 'var(--lt-palette-tertiary10)',
          20: 'var(--lt-palette-tertiary20)',
          30: 'var(--lt-palette-tertiary30)',
          40: 'var(--lt-palette-tertiary40)',
          50: 'var(--lt-palette-tertiary50)',
          60: 'var(--lt-palette-tertiary60)',
          70: 'var(--lt-palette-tertiary70)',
          80: 'var(--lt-palette-tertiary80)',
          90: 'var(--lt-palette-tertiary90)',
          95: 'var(--lt-palette-tertiary95)',
          98: 'var(--lt-palette-tertiary98)',
          99: 'var(--lt-palette-tertiary99)',
          container: 'var(--lt-palette-tertiary90)',
          onContainer: 'var(--lt-palette-tertiary30)',
        },
        error: {
          DEFAULT: 'var(--lt-palette-error40)',
          10: 'var(--lt-palette-error10) ',
          20: 'var(--lt-palette-error20)',
          30: 'var(--lt-palette-error30)',
          40: 'var(--lt-palette-error40)',
          50: 'var(--lt-palette-error50)',
          60: 'var(--lt-palette-error60)',
          70: 'var(--lt-palette-error70)',
          80: 'var(--lt-palette-error80)',
          90: 'var(--lt-palette-error90)',
          95: 'var(--lt-palette-error95)',
          98: 'var(--lt-palette-error98)',
          99: 'var(--lt-palette-error99)',
          container: 'var(--lt-palette-error90)',
          onContainer: 'var(--lt-palette-error30)',
        },

        success: {
          DEFAULT: 'var(--lt-palette-success40)',
          10: 'var(--lt-palette-success10)',
          20: 'var(--lt-palette-success20)',
          30: 'var(--lt-palette-success30)',
          40: 'var(--lt-palette-success40)',
          50: 'var(--lt-palette-success50)',
          60: 'var(--lt-palette-success60)',
          70: 'var(--lt-palette-success70)',
          80: 'var(--lt-palette-success80)',
          90: 'var(--lt-palette-success90)',
          95: 'var(--lt-palette-success95)',
          98: 'var(--lt-palette-success98)',
          99: 'var(--lt-palette-success99)',
          container: 'var(--lt-palette-success90)',
          onContainer: 'var(--lt-palette-success30)',
        },

        onPrimary: {
          DEFAULT: '#ffffff',
        },

        neutral: {
          DEFAULT: 'var(--lt-palette-neutral40)',
          10: 'var(--lt-palette-neutral10)',
          20: 'var(--lt-palette-neutral20)',
          25: 'var(--lt-palette-neutral25)',
          30: 'var(--lt-palette-neutral30)',
          35: 'var(--lt-palette-neutral35)',
          40: 'var(--lt-palette-neutral40)',
          50: 'var(--lt-palette-neutral50)',
          60: 'var(--lt-palette-neutral60)',
          70: 'var(--lt-palette-neutral70)',
          80: 'var(--lt-palette-neutral80)',
          90: 'var(--lt-palette-neutral90)',
          95: 'var(--lt-palette-neutral95)',
          98: 'var(--lt-palette-neutral98)',
          99: 'var(--lt-palette-neutral99)',
        },
      },

      animation: {
        scale: 'scale 0.3s ease-in-out',
        'scale-out': 'scale-out 0.3s ease-in-out',
      },

      keyframes: {
        scale: {
          from: {
            transform: 'scale(0.5)',
            opacity: '0.3',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },

        'scale-out': {
          from: {
            transform: 'scale(1)',
            opacity: '1',
          },
          to: {
            transform: 'scale(0.2)',
            opacity: '0.2',
          },
        },
      },
      
    },
  },
  plugins: [],
};

