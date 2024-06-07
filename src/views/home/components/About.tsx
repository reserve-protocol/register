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
