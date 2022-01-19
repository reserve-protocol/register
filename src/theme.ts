import type { Theme } from 'theme-ui'

export const boxShadow =
  '0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)'

export const colors = {
  text: '#000',
  background: '#fff',
  bgCard: '#fff',
  primary: '#00FFBF',
  primaryAccent: '#1fea00',
  grey: '#ccc',
  secondary: '#77838F',
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
    body: 'sans-serif',
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
    sectionTitle: {
      fontSize: 3,
      display: 'block',
    },
    contentTitle: {
      color: '#77838F',
      display: 'block',
      fontSize: 1,
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
      margin: 0,
      borderCollapse: 'collapse',
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'left',
      width: '100%',
      borderSpacing: 0,
      p: {
        m: 0,
      },
      pre: {
        mt: 2,
        mb: 0,
      },
    },
    th: {
      border: 'none',
      px: 2,
      pl: 3,
    },
    tbody: {
      'tr:last-of-type': {
        borderBottom: 0,
      },
    },
    thead: {
      borderBottom: (t: Theme) => ` 1px solid  ${t.colors?.shadow}`,
      backgroundColor: 'header',
      color: 'text',
    },
    td: {
      py: 3,
      px: 3,
      borderBottom: 0,
    },
    tdgroup: {
      lineHeight: '24px',
      background: '#fafbfc',
      whiteSpace: 'nowrap',
      py: 3,
      fontWeight: 'bold',
      // fontFamily: 'monospace',
      flexDirection: 'row',
      alignItems: 'center',
    },
    tr: {
      borderBottom: (t: Theme) => ` 1px solid  ${t.colors?.shadow}`,
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
      color: '#fff',
      backgroundColor: 'black',

      '&:hover': {
        filter: 'brightness(0.85)',
      },
      '&:disabled': {
        backgroundColor: 'grey',
        cursor: 'default',
      },
    },
    accent: {
      cursor: 'pointer',
      transition: 'all .2s ease',
      backgroundColor: 'primary',
      color: 'black',

      '&:hover': {
        filter: 'brightness(0.85)',
      },
      '&:disabled': {
        backgroundColor: 'grey',
        cursor: 'default',
      },
    },
  },
}
