import type { Theme } from 'theme-ui'

export const boxShadow =
  '0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)'

export const colors = {
  text: '#000',
  background: '#f5f5f5',
  bgCard: '#fff',
  primary: '#00b600',
  primaryDark: '#008100',
  primaryAccent: '#1fea00',
  modes: {
    dark: {
      text: '#fff',
      background: '#000',
      secondaryBackground: '#202128',
      primary: '#00b600',
      bgCard: '#191C20',
    },
  },
}

// rgb(195, 197, 203)

export const theme: Theme = {
  breakpoints: ['40em', '52em', '64em'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors,
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },
    primary: {
      color: 'text',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'text',
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1,
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0,
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
  },
  forms: {
    input: {
      // transition: 'border .2s ease,color .2s ease',
      // outline: 'none',
    },
  },
  cards: {
    primary: {
      padding: 3,
      borderRadius: 4,
      boxShadow,
      backgroundColor: 'bgCard',
    },
  },
  buttons: {
    primary: {
      cursor: 'pointer',
      transition: 'all .2s ease',

      '&:hover': {
        backgroundColor: 'primaryDark',
      },
    },
  },
}
