import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import MovieIcon from 'components/icons/MovieIcon'
import { Box, Image, Text, useColorMode } from 'theme-ui'

const About = () => {
  const [colorMode] = useColorMode()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        borderRadius: [0, '14px'],
        border: ['1px solid', '1px solid', '2px solid'],
        borderColor:
          colorMode === 'dark'
            ? ['border', 'border', 'border']
            : ['reserveBackground', 'reserveBackground', 'reserveBackground'],
        background: colorMode === 'dark' ? 'transparent' : 'cardAlternative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => window.open('https://reserve.org/monetarium/', '_blank')}
    >
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Image
          src={
            colorMode === 'dark'
              ? '/imgs/bg-dark-recap-monetarium.png'
              : '/imgs/bg-light-recap-monetarium.png'
          }
          alt="Monetarium background"
          sx={{
            objectFit: 'fill',
            width: '100%',
            height: '100%',
            objectPosition: 'bottom',
            opacity: colorMode === 'dark' ? 0.4 : 1,
          }}
        />
      </Box>

      <Box
        variant="layout.verticalAlign"
        px={3}
        py="12px"
        sx={{
          width: '100%',
          position: 'relative',
          gap: '10px',
          borderTop: ['1px solid', '1px solid', '2px solid'],
          borderColor:
            colorMode === 'dark'
              ? ['border', 'border', 'border']
              : ['reserveBackground', 'reserveBackground', 'reserveBackground'],
          backgroundColor: 'cardAlternative',
          overflow: 'hidden',
          '::before': {
            content: '""',
            background: 'rgba(255, 255, 255, 0.4)',
            width: '40%',
            height: '100%',
            top: '0%',
            left: '-125%',
            transform: 'skew(65deg)',
            position: 'absolute',
            animation: 'slideStripe 4s linear infinite',
          },
          '@keyframes slideStripe': {
            '0%': { left: '-125%' },
            '23.08%': { left: '125%' },
            '100%': { left: '125%' },
          },
        }}
      >
        <Box sx={{ color: 'accentInverted' }}>
          <MovieIcon />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Text
            variant="sectionTitle"
            color="accentInverted"
            sx={{ fontSize: 18 }}
          >
            Monetarium 1 recap
          </Text>
          <Text sx={{ opacity: 0.85 }}>
            Watch the event recap and get notified about Monetarium 2
          </Text>
        </Box>
        <Box ml="auto" sx={{ color: 'accentInverted' }}>
          <ExternalArrowIcon width={26} height={26} />
        </Box>
      </Box>
    </Box>
  )
}

export default About
