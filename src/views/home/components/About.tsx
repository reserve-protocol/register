import { ArrowUpRight } from 'react-feather'
import { Box, Image, Text } from 'theme-ui'

const About = () => {
  return (
    <Box sx={{ position: 'relative' }}>
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
          onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
        >
          <Text variant="bold" color="#999">
            About Reserve
          </Text>
          <ArrowUpRight color="#999" size={16} />
        </Box>
      </Box>
      <Image
        src="/imgs/bg-about.png"
        alt="About background"
        sx={{
          objectFit: 'fill',
          width: '100%',
          height: '330px',
        }}
      />
    </Box>
  )
}

export default About
