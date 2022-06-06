import type { Theme } from 'theme-ui'

export const boxShadow = '0px 4px 34px rgba(0, 0, 0, 0.03)'
export const transition = 'all .2s ease'
export const borderRadius = {
  inputs: 10,
  boxes: 16,
}
export const baseButton = {
  borderRadius: 50,
  fontWeight: 500,
  cursor: 'pointer',
  transition,
  color: '#fff',
  backgroundColor: 'primary',
  padding: 12,

  '&:hover': {
    filter: 'brightness(0.85)',
  },
  '&:disabled': {
    backgroundColor: 'disabled',
    cursor: 'default',
    color: '#fff',
  },
}

export const smallButton = {
  fontSize: 1,
  padding: 2,
  borderRadius: 35,
}

export const colors = {
  text: '#000',
  secondaryText: '#666666',
  background: '#F9F8F4',
  lightBackground: '#F2F2F2',
  contentBackground: '#fff',
  primary: '#000000',
  accent: '#00FFBF',
  secondary: '#E8E8E8',
  border: '#DFDFDF',
  disabled: '#ccc',
  danger: '#FF0000',
  warning: '#FF7A00',
  modes: {
    dark: {
      text: '#fff',
      background: '#121212',
      secondary: '#333333',
      border: '#333333',
      contentBackground: '#1A1A1A',
      secondaryBackground: '#202128',
      primary: '#00b600',
      bgCard: '#FBFDFE',
    },
  },
}

export const theme: Theme = {
  breakpoints: ['52em', '64em', '100em'],
  space: [0, 4, 8, 16, 24, 32, 64, 128, 256, 512],
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 400,
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
    subtitle: {
      fontSize: 2,
      display: 'block',
      color: 'secondaryText',
    },
    sectionTitle: {
      fontSize: 4,
      fontWeight: 400,
      display: 'block',
    },
    contentTitle: {
      color: '#808080',
      display: 'block',
      fontSize: 1,
    },
    primary: {
      color: 'text',
    },
    error: {
      color: 'danger',
    },
    legend: {
      color: '#808080',
    },
    a: {
      transition,
      color: '#808080',
      textDecoration: 'underline',
      cursor: 'pointer',
      '&:hover': {
        color: 'text',
      },
    },
  },
  styles: {
    a: {
      transition,
      color: '#808080',
      textDecoration: 'none',
      borderBottom: '1px solid',
      cursor: 'pointer',
      '&:hover': {
        color: 'text',
      },
    },
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'text',
    },
    hr: {
      borderColor: 'border',
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
      borderColor: 'var(--theme-ui-colors-border)',
      borderRadius: borderRadius.inputs,

      '&:focus': {
        borderColor: 'none',
      },

      '&:disabled': {
        backgroundColor: 'secondary',
        borderColor: 'secondary',
        cursor: 'default',
      },
    },
  },
  cards: {
    primary: {
      borderRadius: borderRadius.boxes,
      padding: 3,
      boxShadow,
      backgroundColor: 'contentBackground',
    },
  },
  buttons: {
    primary: baseButton,
    accent: {
      ...baseButton,
      backgroundColor: 'accent',
      color: 'black',
    },
    transparent: {
      ...baseButton,
      backgroundColor: 'primary',
      color: '#E5E6E9',
    },
    circle: {
      ...baseButton,
      backgroundColor: 'lightBackground',
      color: 'secondaryText',
      display: 'flex',
      alignContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: '100%',
      height: 24,
      width: 24,
      padding: 1,
    },
  },
}
