import ClockIcon from 'components/icons/ClockIcon'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TicketIcon from 'components/icons/TicketIcon'
import { Box, Image, Text, useColorMode } from 'theme-ui'

const About = () => {
  const [colorMode] = useColorMode()

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        flexGrow: 1,
        borderRadius: [0, '14px'],
        border: '0.5px solid',
        borderColor: 'white',
        background: colorMode === 'dark' ? 'transparent' : 'primary',
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
        cursor: 'pointer',
      }}
      onClick={() => window.open('https://reserve.org/monetarium/', '_blank')}
    >
      <Image
        src="/imgs/bg-monetarium.png"
        alt="Monetarium background"
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: [200, 160],
          maxHeight: '100%',
          minHeight: '100%',
          opacity: colorMode === 'dark' ? 0.8 : 1,
        }}
      />
      <Box
        variant="layout.verticalAlign"
        px={3}
        py="12px"
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          left: 0,
          gap: 2,
          color: 'white',
          borderTop: '1px solid',
          borderColor: 'white',
          background:
            'linear-gradient(180deg, rgba(9, 85, 172, 0.25) 0%, rgba(9, 85, 172, 0.95) 100%)',
        }}
      >
        <TicketIcon />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Text variant="sectionTitle" sx={{ fontSize: 18 }}>
            Monetarium, San Francisco
          </Text>
          <Text sx={{ opacity: 0.85 }}>July 19-21, 2024</Text>
        </Box>
        <Box ml="auto">
          <ExternalArrowIcon width={26} height={26} />
        </Box>
      </Box>
    </Box>
  )
}

export default About
