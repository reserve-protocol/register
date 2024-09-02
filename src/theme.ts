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
  inner: '4px',
}
export const baseButton = {
  borderRadius: borderRadius.inputs,
  fontWeight: 500,
  cursor: 'pointer',
  color: '#fff',
  backgroundColor: 'primary',
  padding: '12px 16px',

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
  fontWeight: 700,
  borderRadius: 30,
  padding: '6px 14px',
}

export const baseInput = {
  fontFamily: 'body',
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
  background: '#FEFBF8',
  backgroundNested: '#FEFBF8',
  focusedBackground: '#FFFFFF',
  inputBackground: '#E5E5E5',
  inputAlternativeBackground: '#f2f2f2',
  // contentBackground: '#F9F8F4',
  lightGrey: '#f2f2f2',
  focusBox: '#f2f2f2',
  contentBackground: '#F9EDDD',
  reserveBackground: '#F9EDDD',
  contentLightBackground: 'rgba(249, 248, 244, 0.5)',
  primary: '#2150A9',
  success: '#11BB8D',
  accentAction: '#106D46',
  accentBG: '#D5DBE7',
  accentText: '#00814B',
  secondary: '#E8E8E8',
  secondaryBackground: '#E5E5E5',
  rBlue: '#2150A9', // TODO: Remove in favor for accent
  accent: '#2150A9',
  accentInverted: '#2150A9', // Change to white on darkmode
  rBlueLight: '#DBE3F1',
  border: '#E5E5E5',
  borderFocused: '#F8EDDA',
  borderSecondary: '#E5E5E5',
  darkBorder: '#E0D5C7',
  inputBorder: '#D5D5D5',
  info: '#20678E',
  infoBG: 'rgba(32, 103, 142, 0.15)',
  disabled: '#D9D9D9',
  danger: '#FF0000',
  dangerBG: 'rgba(255, 0, 0, 0.15)',
  muted: '#D9D9D9',
  warning: '#FF8A00',
  modalOverlay: 'rgba(0, 0, 0, 0.2)',
  cardAlternative: '#fff',
  diva: '#A71EFE',
  divaBorder: 'rgba(180, 34, 252, 0.16)',
  divaBackground: 'rgba(167, 30, 254, 0.12)',
  rebalancing: '#FF8A00',
  progressBar: 'white',
  progressBarBackground: 'black',
  bgIcon: '#F2F2F2',
  modes: {
    dark: {
      accentInverted: '#fff',
      text: '#E4DEDE',
      shadow: 'rgba(0, 0, 0, 0.2)',
      rBlueLight: '#0D1321',
      secondaryText: '#969696',
      invertedText: '#171515',
      lightText: '#6F6666',
      background: '#0C0C0B',
      reserveBackground: '#171311',
      contentBackground: '#11100F',
      secondaryBackground: '#262321',
      contentLightBackground: 'rgba(15, 14, 13, 0.5)',
      primary: '#2150A9',
      secondary: '#262321',
      backgroundNested: '#181715',
      focusedBackground: '#262321',
      focusBox: '#191816',
      inputBackground: '#000000',
      inputAlternativeBackground: '#000000',
      disabled: '#242424',
      accentAction: '#106D46',
      accentBG: '#08142A',
      border: '#272625',
      borderFocused: '#2B2723',
      borderSecondary: '#322F2C',
      darkBorder: '#343230',
      inputBorder: '#403C39',
      success: '#75FBC3',
      info: '#20678E',
      infoBG: 'rgba(32, 103, 142, 0.4)',
      danger: '#FF0000',
      dangerBG: 'rgba(255, 0, 0, 0.4)',
      muted: '#3E3B37',
      warning: '#FF7A00',
      modalOverlay: 'rgba(20, 20, 20, 0.6)',
      cardAlternative: '#252421',
      diva: '#A71EFE',
      divaBorder: 'rgba(180, 34, 252, 0.16)',
      divaBackground: 'rgba(167, 30, 254, 0.12)',
      rebalancing: '#FF8A00',
      progressBar: 'black',
      progressBarBackground: 'white',
      bgIcon: '#1E1E1E',
    },
  },
}

export const theme: Theme = {
  breakpoints: ['52em', '64em', '72em', '100em'],
  space: [0, 4, 8, 16, 24, 32, 40, 48, 80, 256], // 0-9
  fonts: {
    body: 'Satoshi, sans-serif, -apple-system, BlinkMacSystemFont',
    // heading: 'inherit',
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
      // fontFamily: 'heading',
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
      fontWeight: 700,
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
    bold: {
      fontWeight: 700,
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
    accent: {
      color: 'accent',
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
      fontWeight: 500,
      color: 'red',
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
    checkbox: {
      mozAppearance: 'none',
      webkitAppearance: 'none',
      outline: 'none',
      'input:focus ~ &': {
        bg: 'transparent',
        backgroundColor: 'transparent',
      },
    },
    radio: {
      mozAppearance: 'none',
      webkitAppearance: 'none',
      outline: 'none',
      'input:focus ~ &': {
        bg: 'transparent',
        backgroundColor: 'transparent',
      },
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
    transparent: {
      fontFamily: 'body',
      padding: 0,
      outline: 'none',
      border: 'none',
      backgroundColor: 'transparent',
      mozAppearance: 'none',
      webkitAppearance: 'none',
      fontWeight: 700,
      fontSize: 4,
    },
  },
  cards: {
    primary: {
      borderRadius: borderRadius.boxes,
      padding: 3,
      backgroundColor: 'contentBackground',
    },
    form: {
      borderRadius: borderRadius.boxes,
      padding: 3,
      border: '3px solid',
      borderColor: 'borderFocused',
      backgroundColor: 'contentBackground',
    },
    inner: {
      borderRadius: borderRadius.inputs,
      padding: 0,
      width: '100%',
      height: 'fit-content',
      backgroundColor: 'backgroundNested',
    },
    section: {
      borderRadius: 0,
      padding: 4,
      width: '100%',
      background: 'background',
      ':hover': {
        background: 'border',
      },
    },
  },
  buttons: {
    primary: baseButton,
    blue: {
      ...baseButton,
      backgroundColor: 'rBlue',
    },
    accent: {
      ...baseButton,
      backgroundColor: 'accent',
    },
    accentAction: {
      ...baseButton,
      backgroundColor: 'accentBG',
      color: 'accent',
      fontWeight: 700,
      borderRadius: borderRadius.inner,
      '&:hover': {
        fontWeight: 700,
      },
    },
    bordered: {
      ...baseButton,
      outline: '2px solid',
      borderColor: 'primary',
      color: 'accentInverted',
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'focusedBackground',
      },
    },
    transparent: {
      ...baseButton,
      backgroundColor: 'transparent',
      border: '1px solid',
      borderColor: 'inputBorder',
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
        backgroundColor: 'border',
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
      borderColor: 'border',
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
      backgroundColor: 'focusedBackground',
      border: '2px solid',
      borderColor: 'border',
    },
    info: {
      ...baseBadge,
      color: 'primary',
      backgroundColor: 'focusedBackground',
      border: '2px dashed',
      borderColor: 'border',
    },
    danger: {
      ...baseBadge,
      color: 'danger',
      backgroundColor: 'backgroundNested',
      border: '2px solid',
      borderColor: 'border',
    },
    success: {
      ...baseBadge,
      color: 'success',
      backgroundColor: 'focusedBackground',
      border: '2px solid',
      borderColor: 'border',
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
      top: 0,
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
    tokenView: {
      width: '100%',
      p: [1, 4],
    },
    sectionDivider: {
      mx: [-1, -3, -3, -3, -6],
      my: [3, 5],
      borderColor: 'border',
    },
  },
}
