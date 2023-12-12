import type { Theme } from 'theme-ui'
import 'react-loading-skeleton/dist/skeleton.css'
import './app.css'

export const boxShadow = '0px 10px 20px var(--theme-ui-colors-shadow)'
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
  inner: '10px',
}
export const baseButton = {
  borderRadius: 50,
  fontWeight: 500,
  cursor: 'pointer',
  color: '#fff',
  backgroundColor: 'primary',
  padding: '14px',
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

const baseBadge = {
  color: 'text',
  backgroundColor: 'border',
  fontWeight: 400,
  borderRadius: 30,
  padding: '6px 14px',
}

export const baseInput = {
  borderColor: 'inputBorder',
  backgroundColor: 'background',
  outline: 'none',
  padding: '14px',
  paddingLeft: '16px',
  borderRadius: borderRadius.inputs,
  mozAppearance: 'none',
  webkitAppearance: 'none',
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

export const mediumButton = {
  padding: ['4px 10px 4px 10px', '12px 16px 12px 16px'],
  fontSize: [1, 2],
  borderRadius: borderRadius.inputs,
}

export const colors = {
  base: '#2852F5',
  text: '#292929',
  shadow: 'rgba(0, 0, 0, 0.05)',
  invertedText: '#FFFFFF',
  secondaryText: '#666666',
  lightText: '#808080',
  background: '#FFFFFF',
  contentBackground: '#F9F8F4',
  contentLightBackground: 'rgba(249, 248, 244, 0.5)',
  primary: '#000000',
  success: '#11BB8D',
  accentAction: '#106D46',
  accentBG: '#DBE9E4',
  accentText: '#00814B',
  secondary: '#E8E8E8',
  rBlue: '#2150A9',
  rBlueLight: '#DBE3F1',
  border: '#efefef',
  darkBorder: '#E5E5E5',
  inputBorder: '#E5E5E5',
  info: '#20678E',
  infoBG: 'rgba(32, 103, 142, 0.15)',
  disabled: '#D9D9D9',
  danger: '#FF0000',
  dangerBG: 'rgba(255, 0, 0, 0.15)',
  muted: '#D9D9D9',
  warning: '#FF8A00',
  modalOverlay: 'rgba(0, 0, 0, 0.2)',
  modes: {
    dark: {
      text: '#e4dede',
      shadow: 'rgba(0, 0, 0, 0.2)',
      rBlueLight: '#0D1321',
      secondaryText: '#969696',
      invertedText: '#FFFFFF',
      lightText: '#6f6666',
      background: '#090707',
      contentBackground: '#171311',
      contentLightBackground: 'rgba(15, 14, 13, 0.5)',
      primary: '#6D3210',
      secondary: '#33261f',
      disabled: '#231f1f',
      accentAction: '#106D46',
      accentBG: '#041B11',
      border: '#1A1A1A',
      darkBorder: '#241c19',
      inputBorder: '#2c2521',
      success: '#75FBC3',
      info: '#20678E',
      infoBG: 'rgba(32, 103, 142, 0.4)',
      danger: '#FF0000',
      dangerBG: 'rgba(255, 0, 0, 0.4)',
      muted: '#D9D9D9',
      warning: '#FF7A00',
      modalOverlay: 'rgba(20, 20, 20, 0.6)',
    },
  },
}

export const theme: Theme = {
  breakpoints: ['52em', '64em', '72em', '100em'],
  space: [0, 4, 8, 16, 24, 32, 40, 48, 80, 256], // 0-9
  fonts: {
    body: 'Satoshi, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
    fontDisplay: 'swap',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 56, 96],
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 600,
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
      display: 'block',
    },
    pageTitle: {
      fontSize: 5,
      fontWeight: 600,
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
    warning: {
      color: 'warning',
    },
    error: {
      color: 'danger',
    },
    legend: {
      color: 'secondaryText',
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
      px: [3, 4],
      color: 'secondaryText',
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
      py: [3, 4],
      px: [3, 4],
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
      paddingLeft: '6px',
    },
    select: {
      ...baseInput,
      backgroundColor: 'background',
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
      backgroundColor: 'accentBG',
    },
    accentAction: {
      ...baseButton,
      backgroundColor: 'accentBG',
      border: '1px solid',
      borderColor: 'accentAction',
      color: 'accentText',
      fontWeight: 500,

      '&:hover': {
        color: 'text',
        borderColor: 'text',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.05)',
      },
    },
    bordered: {
      ...baseButton,
      border: '1px solid',
      borderColor: 'primary',
      color: 'primary',
      backgroundColor: 'transparent',
    },
    transparent: {
      ...baseButton,
      backgroundColor: 'transparent',
      border: '1px solid',
      borderColor: 'darkBorder',
      color: 'text',
      '&:hover': {
        borderColor: 'text',
      },
    },
    hover: {
      ...baseButton,
      backgroundColor: 'transparent',
      border: '1px solid',
      borderColor: 'transparent',
      color: 'text',
      '&:hover': {
        borderColor: 'text',
      },
    },
    muted: {
      ...baseButton,
      backgroundColor: 'secondary',
      color: 'text',
    },
    danger: {
      ...baseButton,
      backgroundColor: 'dangerBG',
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
      backgroundColor: 'background',
      border: '1px solid',
      borderColor: 'darkBorder',
      color: 'text',
      display: 'flex',
      borderRadius: '6px',
      alignContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      height: 28,
      width: 28,
      paddingLeft: 1,
      paddingRight: 1,
      padding: 1,
    },
  },
  badges: {
    primary: baseBadge,
    muted: {
      ...baseBadge,
      color: 'text',
      backgroundColor: 'contentBackground',
      border: '1px solid',
      borderColor: 'lightText',
    },
    info: {
      ...baseBadge,
      color: 'text',
      backgroundColor: 'contentBackground',
      border: '1px dashed',
      borderColor: 'text',
    },
    danger: {
      ...baseBadge,
      color: 'danger',
      backgroundColor: 'contentBackground',
      border: '1px solid',
      borderColor: 'lightText',
    },
    success: {
      ...baseBadge,
      color: 'success',
      backgroundColor: 'contentBackground',
      border: '1px solid',
      borderColor: 'lightText',
    },
  },
  layout: {
    wrapper: {
      maxWidth: '95em',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    container: {
      boxSizing: 'border-box',
      flexShrink: 0,
      paddingX: [1, 3],
      paddingY: [1, 6],
    },
    containerCompact: {
      boxSizing: 'border-box',
      flexShrink: 0,
      paddingX: [1, 6, 6, 8],
      paddingY: [1, 6],
    },
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
      top: ['72px', '168px', '184px'],
    },
    stickyNoHeader: {
      position: 'sticky',
      top: ['72px', '96px', '112px'],
    },
    square: {
      marginX: 1,
      height: '4px',
      width: '4px',
      backgroundColor: 'lightText',
    },
  },
}
