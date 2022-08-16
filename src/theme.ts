import type { Theme } from 'theme-ui'

export const boxShadow = '0px 4px 34px rgba(0, 0, 0, 0.03)'
export const transition = 'all .2s ease'
export const centeredContent = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}
export const borderRadius = {
  inputs: 10,
  boxes: 16,
}
export const baseButton = {
  borderRadius: 60,
  fontWeight: 500,
  cursor: 'pointer',
  color: '#fff',
  backgroundColor: 'primary',
  padding: 12,

  '&:hover': {
    filter: 'brightness(0.85)',
  },
  '&:disabled': {
    backgroundColor: 'disabled',
    cursor: 'default',
    color: '#999999',
  },
}

export const baseInput = {
  borderColor: 'inputBorder',
  outlineColor: '#000',
  borderRadius: borderRadius.inputs,

  '&:disabled': {
    backgroundColor: 'secondary',
    borderColor: 'secondary',
    cursor: 'default',
  },
}

export const smallButton = {
  fontSize: 0,
  paddingTop: 1,
  paddingBottom: 1,
  paddingLeft: 3,
  paddingRight: 3,
  borderRadius: 4,
}

export const colors = {
  boldText: '#111',
  text: '#333',
  secondaryText: '#666666',
  lightText: '#808080',
  background: '#F9F8F4',
  lightBackground: '#F2F2F2',
  contentBackground: '#fff',
  primary: '#000000',
  success: '#11BB8D',
  accent: '#00FFBF',
  secondary: '#E8E8E8',
  border: '#DFDFDF',
  inputBorder: '#E5E5E5',
  disabled: '#E5E5E5',
  danger: '#FF0000',
  muted: '#D9D9D9',
  warning: '#FF7A00',
  modes: {
    dark: {
      text: '#fff',
      boldText: '#fff',
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
  breakpoints: ['52em', '64em', '72em', '100em'],
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
    title: {
      fontSize: 3,
      fontWeight: 500,
      display: 'block',
    },
    sectionTitle: {
      fontSize: 3,
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
    muted: {
      color: 'muted',
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
      borderCollapse: 'separate',
      fontSize: 1,
      lineHeight: '16px',
      textAlign: 'left',
      width: '100%',
      position: 'relative',
      overflow: 'auto',
      borderSpacing: '0 14px',
      display: 'flex',
      flexDirection: 'column',
      // '&::-webkit-scrollbar': {
      //   display: 'none',
      // },
      scrollbarWidth: 'none',

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
      px: 3,
      color: 'lightText',
      // pl: 3,
      fontWeight: 'normal',
    },
    tbody: {
      'tr:last-of-type': {
        borderBottom: 0,
      },
      display: 'table',
      width: '100%',
    },
    thead: {
      display: 'table',
      width: '100%',
      color: 'lightText',
      marginBottom: -20,
    },
    td: {
      py: 3,
      px: 3,
      borderBottom: 0,

      '&:first-of-type': {
        borderTopLeftRadius: borderRadius.boxes,
        borderBottomLeftRadius: borderRadius.boxes,
      },
      '&:last-of-type': {
        borderTopRightRadius: borderRadius.boxes,
        borderBottomRightRadius: borderRadius.boxes,
      },
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
      backgroundColor: 'contentBackground',
      // borderBottom: (t: Theme) => ` 1px solid  ${t.colors?.shadow}`,
    },
  },
  forms: {
    input: {
      ...baseInput,
    },
    select: {
      ...baseInput,
      backgroundColor: 'contentBackground',
    },
    inputError: {
      ...baseInput,
      outlineColor: 'danger',
      borderColor: 'danger',
      color: 'danger',
    },
  },
  cards: {
    primary: {
      borderRadius: borderRadius.boxes,
      padding: 3,
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
    muted: {
      ...baseButton,
      backgroundColor: 'inputBorder',
      color: 'black',
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
  layout: {
    borderBox: {
      border: '1px solid',
      borderColor: 'border',
      borderRadius: borderRadius.boxes,
      padding: 4,
    },
    card: {
      backgroundColor: 'contentBackground',
      borderRadius: borderRadius.boxes,
    },
    centered: {
      ...centeredContent,
      flexDirection: 'column',
    },
    verticalAlign: {
      display: 'flex',
      alignItems: 'center',
    },
  },
}
