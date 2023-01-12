import type { Theme } from 'theme-ui'
import './app.css'

export const boxShadow = '0px 4px 34px rgba(0, 0, 0, 0.05)'
export const transition = 'all .2s ease'
export const centeredContent = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}
export const borderRadius = {
  inputs: 6,
  boxes: 14,
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
    color: '#484848',
    border: 'none',
  },
}

export const baseInput = {
  borderColor: 'inputBorder',
  backgroundColor: 'background',
  outline: 'none',
  padding: '12px',
  borderRadius: borderRadius.inputs,
  '&:disabled': {
    backgroundColor: 'border',
    borderColor: 'secondary',
    cursor: 'default',
  },
  '&:hover': {
    backgroundColor: 'background',
  },
  '&:focus': {
    backgroundColor: 'background',
  },
}

export const smallButton = {
  fontSize: 1,
  paddingTop: 1,
  paddingBottom: 1,
  paddingLeft: '10px',
  paddingRight: '10px',
  borderRadius: 6,
}

export const colors = {
  boldText: '#292929',
  text: '#292929',
  secondaryText: '#666666',
  lightText: '#808080',
  background: 'white',
  lightBackground: '#F2F2F2',
  contentBackground: '#F9F8F4',
  contentLightBackground: 'rgba(255, 255, 255, 0.5)',
  primary: '#000000',
  success: '#11BB8D',
  accentAction: '#75FBC3',
  accent: '#003326',
  secondary: '#E8E8E8',
  border: '#F2F2F2',
  darkBorder: '#EEEDE9',
  inputBorder: '#E5E5E5',
  disabled: '#E5E5E5',
  danger: '#FF0000',
  muted: '#D9D9D9',
  warning: '#FF7A00',
  modalOverlay: 'rgb(0, 0, 0, 0.2)',
  modes: {
    dark: {
      text: '#CCCCCC',
      boldText: '#CCCCCC',
      background: '#000',
      secondary: '#191919',
      disabled: '#171717',
      accentAction: 'white',
      accent: 'white',
      border: '#1A1A1A',
      inputBorder: '#1F1F1F',
      darkBorder: '#1A1A1A', // TODO
      contentBackground: '#0F0E0D',
      lightBackground: '#131313',
      contentLightBackground: '#090909',
      secondaryBackground: '#202128',
      primary: '#4C3121',
      bgCard: '#FBFDFE',
      modalOverlay: 'rgb(100, 100, 100, 0.35)',
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
      fontSize: 4,
      fontWeight: 500,
      letterSpacing: '0.01em',
      display: 'block',
    },
    pageTitle: {
      fontSize: 5,
      fontWeight: 500,
      letterSpacing: '0.01em',
      display: 'block',
    },
    contentTitle: {
      color: 'lightText',
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
      color: 'lightText',
    },
    muted: {
      color: 'muted',
    },
    a: {
      transition,
      color: 'lightText',
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
      color: 'lightText',
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
      width: '100%',    },
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
    smallInput: {
      ...baseInput,
      padding: '6px',
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
      backgroundColor: 'white',
      color: 'black',
      border: '2px solid',
      borderColor: 'accentAction',
      '&:hover': {
        backgroundColor: 'accentAction',
      },
    },
    transparent: {
      ...baseButton,
      backgroundColor: 'transparent',
      border: '1px solid',
      borderColor: 'inputBorder',
      color: 'text',
    },
    muted: {
      ...baseButton,
      backgroundColor: 'inputBorder',
      color: 'text',
    },
    danger: {
      ...baseButton,
      backgroundColor: 'inputBorder',
      color: 'danger',
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
    sticky: {
      position: 'sticky',
      top: 0,
    },
  },
}
