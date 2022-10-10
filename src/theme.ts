import type { Theme } from 'theme-ui'
import './app.css'

export const boxShadow = '0px 4px 34px rgba(0, 0, 0, 0.03)'
export const transition = 'all .2s ease'
export const centeredContent = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}
export const borderRadius = {
  inputs: 6,
  boxes: 12,
}
export const baseButton = {
  borderRadius: 50,
  fontWeight: 500,
  cursor: 'pointer',
  color: '#fff',
  backgroundColor: 'primary',
  padding: 2,
  paddingLeft: 4,
  paddingRight: 4,

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
  outline: 'none',
  padding: '12px',
  borderRadius: borderRadius.inputs,

  '&:disabled': {
    backgroundColor: 'secondary',
    borderColor: 'secondary',
    cursor: 'default',
  },

  '&:hover': {
    borderColor: 'text',
  },
}

export const smallButton = {
  fontSize: 0,
  paddingTop: 2,
  paddingBottom: 2,
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
  contentLightBackground: '#FCFBF9',
  primary: '#000000',
  success: '#11BB8D',
  accentAction: '#00FFBF',
  accent: '#003326',
  secondary: '#E8E8E8',
  border: '#F2F2F2',
  darkBorder: '#DFDFDF',
  inputBorder: '#E5E5E5',
  disabled: '#E5E5E5',
  danger: '#FF0000',
  muted: '#D9D9D9',
  warning: '#FF7A00',
  modes: {
    dark: {
      text: '#fff',
      boldText: '#fff',
      background: '#080D0B',
      secondary: '#262B29',
      disabled: '#2E3331',
      border: '#333333',
      inputBorder: '#2E3331',
      darkBorder: '#333333', // TODO
      contentBackground: '#171C1A',
      lightBackground: '#1A1A1A',
      contentLightBackground: '#0E1311',
      secondaryBackground: '#202128',
      primary: '#008060',
      bgCard: '#FBFDFE',
    },
  },
}

export const theme: Theme = {
  breakpoints: ['52em', '64em', '72em', '100em'],
  space: [0, 4, 8, 16, 24, 32, 40, 48, 80, 256],
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 56, 96],
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
    strong: {
      fontWeight: 500,
      display: 'block',
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
      borderColor: 'danger',
      color: 'danger',
    },
    textarea: {
      ...baseInput,
      fontFamily: 'inherit',
      fontSize: 'inherit',
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
    },
    accentAction: {
      ...baseButton,
      backgroundColor: 'accentAction',
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
      color: 'text',
    },
    error: {
      ...baseButton,
      '&:disabled': {
        backgroundColor: 'disabled',
        cursor: 'default',
        color: 'danger',
      },
    },
    circle: {
      ...baseButton,
      backgroundColor: 'lightBackground',
      color: 'secondaryText',
      display: 'flex',
      borderRadius: '6px',
      alignContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      height: 24,
      width: 24,
      paddingLeft: 1,
      paddingRight: 1,
      padding: 1,
    },
  },
  badges: {
    primary: {
      color: 'text',
      backgroundColor: 'border',
      fontWeight: 400,
      borderRadius: 30,
      padding: '6px 14px',
    },
  },
  layout: {
    borderBox: {
      border: '1px solid',
      borderColor: 'darkBorder',
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
