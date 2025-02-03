import { useEffect } from 'react'
import { Box, Flex, Text, useColorMode } from 'theme-ui'
import Earn from './components/Earn'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { Trans, t } from '@lingui/macro'
import FeaturedPools from './components/FeaturedPools'
import HelpIcon from 'components/icons/HelpIcon'
import { Zap } from 'lucide-react'
import { colors } from 'theme'
import { MouseoverTooltip } from '@/components/old/tooltip'

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
      pt={[5, 5]}
      mt={[2, 5]}
      pb={0}
      px={[2, 3]}
    >
      <Box sx={{ maxWidth: 900, textAlign: 'center' }} mt={[2, 7]}>
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
            Provide liquidity across DeFi & earn more with your DTFs
          </Trans>
        </Text>
        <Text as="p" px={[2, 0]} sx={{ fontSize: [2, 3] }} mt={[3, 4]}>
          <Trans>
            DeFi yield opportunities for DTFs in Convex, Curve, Yearn & Beefy
          </Trans>
        </Text>
      </Box>
    </Flex>
  </Box>
)

const Info = () => {
  return (
    <Box variant="layout.centered" mt={4} mb={7} pb={[0, 2]}>
      <MouseoverTooltip
        placement="right"
        text={t`DeFi protocols oftentimes have incentives for liquidity that are paid in their token or a combination of tokens. By providing liquidity for trading or lending or other activities on these protocols, you can earn rewards that are sometimes quite high! Note that there are always risks (smart contract risks, impermanent loss risks, etc), in providing liquidity on these protocols so please make sure you understand things before blindly diving in.`}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{
            gap: 2,
            borderRadius: '50px',
            border: '3px solid',
            borderColor: 'border',
            width: 'fit-content',
          }}
          backgroundColor="cardAlternative"
          py={2}
          px={3}
        >
          <Zap strokeWidth={1.5} size={18} color={colors.primary} />

          <Text sx={{ fontWeight: 'bold' }} color="primary">
            How are APYs so high?
          </Text>
          <HelpIcon />
        </Box>
      </MouseoverTooltip>
    </Box>
  )
}

const EarnWrapper = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <HeroBackground />
        <Hero />
        <Info />
        <FeaturedPools />
      </Box>
      <Box variant="layout.wrapper">
        <Earn />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default EarnWrapper
