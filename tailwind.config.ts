import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      screens: {
        '2xl': '1400px',
      },
    },
    fontWeight: {
      light: '300',
      normal: '300',
      medium: '500',
      semibold: '500',
      bold: '700',
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      '3xl': '1.25rem',
      '4xl': '1.5rem',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        borderSecondary: 'hsl(var(--border-secondary))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        tvl: 'hsl(var(--tvl))',
        container: {
          DEFAULT: 'hsl(var(--container))',
          foreground: 'hsl(var(--container-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        mutedSecondary: {
          DEFAULT: 'hsl(var(--muted-secondary))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        legend: {
          DEFAULT: 'hsl(var(--legend))',
          foreground: 'hsl(var(--legend-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        'width-expand': {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        'spin-slow': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-in-out 0s 1 forwards',
        'fade-out': 'fade-out 0.5s ease-in-out 0s 1 forwards',
        'width-expand':
          'width-expand 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        'spin-slow': 'spin-slow 4s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
