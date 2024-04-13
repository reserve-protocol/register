import { useEffect } from 'react'
import { Box, Flex, Text, useColorMode } from 'theme-ui'
import Earn from './components/Earn'
import RegisterAbout from 'views/home/components/RegisterAbout'
import mixpanel from 'mixpanel-browser'
import { Trans } from '@lingui/macro'

const HeroBackground = () => {
  const [colorMode] = useColorMode()
  const url =
    colorMode === 'dark' ? '/imgs/bg-earn-dark.png' : '/imgs/bg-earn-light.png'

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

const Hero = () => (
  <Box sx={{ position: 'relative' }}>
    <Flex
      mx="auto"
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '95em',
      }}
      pt={[5, 4]}
      mt={[0, 5]}
      pb={0}
      px={[2, 3]}
    >
      <Box sx={{ maxWidth: 900, textAlign: 'center' }} mt={[2, 4]}>
        <Text
          variant="title"
          sx={{
            fontSize: [5, 7],
            fontWeight: 'bold',
            color: 'accentInverted',
            lineHeight: ['36px', '62px'],
          }}
        >
          <Trans>
            Provide liquidity across DeFi & Earn more with your RTokens
          </Trans>
        </Text>
        <Text as="p" px={[2, 0]} sx={{ fontSize: [2, 3] }} mt={[3, 4]}>
          <Trans>
            DeFi yield opportunities for RTokens in Convex, Curve, Yearn & Beefy
          </Trans>
        </Text>
      </Box>
    </Flex>
  </Box>
)

const EarnWrapper = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <HeroBackground />
        <Hero />
      </Box>
      <Box variant="layout.wrapper">
        <Earn />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default EarnWrapper
