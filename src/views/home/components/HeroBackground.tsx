import { Box, useColorMode } from 'theme-ui'

const HeroBackground = () => {
  const [colorMode] = useColorMode()
  const url =
    colorMode === 'dark'
      ? '/imgs/bg-compare-dark.png'
      : '/imgs/bg-compare-light.png'

  return (
    <Box
      sx={{
        width: '100%',
        height: '484px',
        top: 0,
        zIndex: -1,
        position: 'absolute',
        background: `url(${url}) no-repeat`,
        backgroundSize: 'cover',
        borderBottom: '3px solid',
        borderColor: 'borderFocused',
      }}
    />
  )
}

export default HeroBackground
