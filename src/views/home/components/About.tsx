import { ArrowUpRight } from 'react-feather'
import { Box, Image, Text, useColorMode } from 'theme-ui'

const About = () => {
  const [colorMode] = useColorMode()
  const url =
    colorMode === 'dark'
      ? '/imgs/bg-about-dark.png'
      : '/imgs/bg-about-light.png'

  return (
    <Box sx={{ position: 'relative' }}>
      {colorMode === 'light' && (
        <Box
          variant="layout.verticalAlign"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            justifyContent: 'space-between',
            width: '100%',
          }}
          p={4}
        >
          <Image src="/svgs/reserve.svg" alt="Reserve logo" />
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: 1,
              cursor: 'pointer',
              ':hover': {
                filter: 'brightness(1.1)',
              },
            }}
            onClick={() =>
              window.open('https://reserve.org/protocol/', '_blank')
            }
          >
            <Text variant="bold" color="#999">
              About Reserve
            </Text>
            <ArrowUpRight color="#999" size={16} />
          </Box>
        </Box>
      )}
      <Image
        src={url}
        alt="About background"
        sx={{
          objectFit: 'cover',
          objectPosition: 'start',
          width: '100%',
          maxHeight: '320px',
          borderRadius: '14px',
          border: '2px solid',
          borderColor: 'reserveBackground',
        }}
      />
    </Box>
  )
}

export default About
