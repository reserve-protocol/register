import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './node_modules/@reserve-protocol/react-zapper/dist/**/*.js',
  ],
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
      transitionDuration: {
        120: '120ms',
        180: '180ms',
        240: '240ms',
      },
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
          hover: 'var(--primary-hover)',
          pressed: 'var(--primary-pressed)',
        },
        brand: {
          DEFAULT: 'var(--brand-surface)',
          deep: 'var(--brand-surface-deep)',
          foreground: 'hsl(var(--primary-foreground))',
          atmosphere: {
            cyan: 'var(--brand-atmosphere-cyan)',
            violet: 'var(--brand-atmosphere-violet)',
            glow: 'var(--brand-atmosphere-glow)',
          },
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        substrate: {
          subtle: 'var(--substrate-subtle)',
        },
        surface: {
          'recessed-content': 'var(--surface-recessed-content)',
        },
        status: {
          neutral: {
            surface: 'var(--status-neutral-surface)',
            border: 'var(--status-neutral-border)',
          },
        },
        disabled: {
          structure: 'var(--disabled-structure)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          hover: 'var(--destructive-hover)',
          pressed: 'var(--destructive-pressed)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        mutedSecondary: {
          DEFAULT: 'hsl(var(--muted-secondary))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        supporting: {
          foreground: 'var(--supporting-foreground)',
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
        feedback: {
          'information-surface': 'var(--feedback-information-surface)',
          'information-border': 'var(--feedback-information-border)',
          'information-foreground': 'var(--feedback-information-foreground)',
          'success-surface': 'var(--feedback-success-surface)',
          'success-border': 'var(--feedback-success-border)',
          'success-foreground': 'var(--feedback-success-foreground)',
          'warning-surface': 'var(--feedback-warning-surface)',
          'warning-border': 'var(--feedback-warning-border)',
          'warning-foreground': 'var(--feedback-warning-foreground)',
          'danger-surface': 'var(--feedback-danger-surface)',
          'danger-border': 'var(--feedback-danger-border)',
          'danger-foreground': 'var(--feedback-danger-foreground)',
        },
        'destructive-action': {
          DEFAULT: 'var(--destructive-action)',
          hover: 'var(--destructive-action-hover)',
          pressed: 'var(--destructive-action-pressed)',
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
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'slide-left': {
          from: { left: '50%' },
          to: { left: 'calc(50% - 150px)' },
        },
        'slide-out-right': {
          from: { right: '0' },
          to: { right: '-395px' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'proposal-bar-sweep': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'accordion-down-v1': 'accordion-down 180ms ease-out',
        'accordion-up-v1': 'accordion-up 180ms ease-in',
        'fade-in': 'fade-in 0.5s ease-in-out 0s 1 forwards',
        'fade-out': 'fade-out 0.5s ease-in-out 0s 1 forwards',
        'dialog-in': 'fade-in 0.2s ease-out',
        'dialog-out': 'fade-out 0.2s ease-in forwards',
        'width-expand':
          'width-expand 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        'spin-slow': 'spin-slow 4s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-left': 'slide-left 0.5s forwards',
        'slide-out-right': 'slide-out-right 0.5s forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'proposal-bar-sweep': 'proposal-bar-sweep 2s linear infinite',
        heartbeat: 'heartbeat 1s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
