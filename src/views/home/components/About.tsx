import { Box, Image, useColorMode } from 'theme-ui'

const About = () => {
  const [colorMode] = useColorMode()
  const url =
    colorMode === 'dark'
      ? '/imgs/bg-about-dark.png'
      : '/imgs/bg-about-light.png'

  return (
    <Box sx={{ position: 'relative' }}>
      <Image
        src={url}
        alt="About background"
        sx={{
          objectFit: 'cover',
          objectPosition: 'left top',
          width: '100%',
          maxHeight: '350px',
          borderRadius: '14px',
          border: '1.5px solid',
          borderColor:
            colorMode === 'dark' ? 'darkBorder' : 'reserveBackground',
        }}
      />
    </Box>
  )
}

export default About
