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
        mx={[1, 3]}
        p={5}
        sx={{
          backgroundColor: 'background',
          flexGrow: 1,
        }}
      >
        <Grid columns={['1fr', '1fr 1fr 1fr']} gap={4}>
          {statInfo.map((info, index) => (
            <Box sx={{ textAlign: 'center' }} key={info.title}>
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
    <Box sx={{ maxWidth: 612, textAlign: 'center' }} mt={3}>
      <Text
        variant="title"
        sx={{ fontSize: [5, 6], lineHeight: ['42px', '56px'] }}
      >
        <Trans>A new path to better money, already set in motion</Trans>
      </Text>
      <Text as="p" variant="legend" px={[4, 0]} mt={4}>
        Reserve's RToken Factory Contracts: A platform for creating tokens
        backed by a diverse array of ERC20 collateral. With Register.app, engage
        in minting, staking, and governance of RTokens. Learn more in-depth
        about the project at{' '}
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
      backgroundColor: 'contentBackground',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    py={7}
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
