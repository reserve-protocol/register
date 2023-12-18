import { Trans, t } from '@lingui/macro'
import ChainLogo from 'components/icons/ChainLogo'
import LeafIcon from 'components/icons/LeafIcon'
import RootIcon from 'components/icons/RootIcon'
import TreeIcon from 'components/icons/TreeIcon'
import { Box, Card, Flex, Grid, Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import useProtocolMetrics from '../hooks/useProtocolMetrics'
import Skeleton from 'react-loading-skeleton'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import YieldIcon from 'components/icons/YieldIcon'

const ProtocolStats = () => {
  const {
    data: { tvl, marketCap, stakeRevenue },
    isLoading,
  } = useProtocolMetrics()

  const statInfo = [
    {
      icon: <TreeIcon />,
      value: formatCurrency(marketCap),
      title: t`Cumulative Total RToken Mkcap`,
    },
    {
      icon: <RootIcon />,
      value: formatCurrency(tvl),
      title: t`TVL in Reserve`,
    },
    {
      icon: <LeafIcon />,
      value: formatCurrency(stakeRevenue),
      title: t`Cumulative Staked RSR income`,
    },
  ]

  return (
    <Box variant="layout.wrapper" sx={{ width: '100%' }} mt={7}>
      <Card
        mx={[1, 4]}
        p={6}
        sx={{
          backgroundColor: 'contentBackground',
          flexGrow: 1,
        }}
      >
        <Grid columns={['1fr', '1fr 1fr 1fr']} gap={[4, 0]}>
          {statInfo.map((info, index) => (
            <Box key={info.title} sx={{ position: 'relative' }}>
              <Box sx={{ textAlign: 'center' }}>
                {info.icon}
                <Box my={2}>
                  {!isLoading ? (
                    <Text variant="sectionTitle">${info.value}</Text>
                  ) : (
                    <Skeleton height={32} width={200} />
                  )}
                </Box>

                <Text variant="legend">{info.title}</Text>
              </Box>
              {!!index && (
                <Box
                  // mx={3}
                  sx={{
                    display: ['none', 'block'],
                    fontSize: 5,
                    color: 'secondaryText',
                    position: 'absolute',
                    left: '-12px',
                    top: 'calc(50% - 20px)',
                  }}
                >
                  <YieldIcon />
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      </Card>
    </Box>
  )
}

const About = () => (
  <>
    <Box variant="layout.verticalAlign">
      <Box
        sx={{ position: 'relative', height: 20, width: 24 }}
        pt={'2px'}
        ml={3}
      >
        <ChainLogo chain={ChainId.Base} style={{ position: 'absolute' }} />
        <ChainLogo
          chain={ChainId.Mainnet}
          style={{ position: 'absolute', left: -10 }}
        />
      </Box>
      <Text>
        <Trans>On Ethereum & Base</Trans>
      </Text>
    </Box>
    <Box sx={{ maxWidth: 840, textAlign: 'center' }} mt={4}>
      <Text
        variant="title"
        sx={{ fontSize: [5, 7], lineHeight: ['42px', '56px'] }}
      >
        <Trans>A new path to better money, already set in motion</Trans>
      </Text>
      <Text as="p" variant="legend" px={[4, 0]} mt={4}>
        Reserve Protocol’s RToken Factory Contracts: A platform for creating
        currencies backed by an array of ERC20 collateral. Use Register.app to
        mint, stake and govern RTokens. Learn more at{' '}
        <Link
          sx={{ textDecoration: 'underline' }}
          href="https://reserve.org/"
          target="_blank"
        >
          reserve.org
        </Link>
      </Text>
    </Box>
  </>
)

const Hero = () => (
  <Flex
    sx={{
      backgroundColor: 'background',
      flexDirection: 'column',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'border',
    }}
    py={[5, 8]}
    px={[3]}
  >
    <About />
    <ProtocolStats />
    <Link
      mt={4}
      sx={{ ':hover': { textDecoration: 'underline' } }}
      href="https://dune.com/reserve-protocol/reserve-protocol-overview"
      target="_blank"
    >
      <Trans>More metrics on Reserve Dune Dashboard</Trans>
      <ExternalArrowIcon
        style={{ position: 'relative', top: '3px', marginLeft: '8px' }}
      />
    </Link>
  </Flex>
)

export default Hero
