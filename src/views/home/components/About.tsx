import { Box, Image, useColorMode } from 'theme-ui'

const About = () => {
  const [colorMode] = useColorMode()

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        flexGrow: 1,
        borderRadius: [0, '14px'],
        border: '1.5px solid',
        borderColor: colorMode === 'dark' ? 'darkBorder' : 'reserveBackground',
        background: colorMode === 'dark' ? 'transparent' : 'white',
        overflow: 'hidden',
        '::before': {
          content: '""',
          background: 'rgba(255, 255, 255, 0.4)',
          width: '60%',
          height: '100%',
          top: '0%',
          left: '-125%',
          transform: 'skew(45deg)',
          position: 'absolute',
          animation: 'slideStripe 4.5s linear infinite',
        },
        '@keyframes slideStripe': {
          '0%': { left: '-125%' },
          '23.08%': { left: '125%' },
          '100%': { left: '125%' },
        },
      }}
    >
      <Image
        src="/imgs/bg-about.png"
        alt="About background"
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: [200, 160],
          maxHeight: '100%',
          minHeight: '100%',
          opacity: colorMode === 'dark' ? 0.25 : 1,
        }}
      />
    </Box>
  )
}

export default About
