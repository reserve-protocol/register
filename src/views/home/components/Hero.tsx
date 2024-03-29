import { Trans, t } from '@lingui/macro'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import LeafIcon from 'components/icons/LeafIcon'
import RootIcon from 'components/icons/RootIcon'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import TreeIcon from 'components/icons/TreeIcon'
import YieldIcon from 'components/icons/YieldIcon'
import Skeleton from 'react-loading-skeleton'
import { Box, Card, Flex, Grid, Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import useProtocolMetrics from '../hooks/useProtocolMetrics'
import { ChainId } from 'utils/chains'

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
    <Box
      variant="layout.wrapper"
      sx={{ width: '100%' }}
      mt={[4, 5]}
      pt={[0, 5]}
    >
      <Link
        sx={{
          ':hover': { textDecoration: 'underline' },
          position: 'relative',
          display: 'flex',
          fontSize: 1,
          justifyContent: 'center',
          textAlign: 'center',
          bottom: '-12px',
        }}
        href="https://dune.com/reserve-protocol/reserve-protocol-overview"
        target="_blank"
      >
        <Box
          px="2"
          py="1"
          sx={{
            backgroundColor: 'contentBackground',
            borderRadius: 8,
            border: '2px solid',
            borderColor: 'background',
            width: 'fit-content',
          }}
        >
          <Trans>More metrics on Dune</Trans>
          <ExternalArrowIcon
            style={{ position: 'relative', top: '3px', marginLeft: '8px' }}
          />
        </Box>
      </Link>
      <Card
        mx={[0, 2]}
        p={6}
        sx={{
          backgroundColor: 'contentBackground',
          flexGrow: 1,
        }}
      >
        <Grid columns={['1fr', '1fr 1fr 1fr']} gap={[4, 0]}>
          {statInfo.map((info, index) => (
            <Box key={info.title} sx={{ position: 'relative' }}>
              <Box sx={{ textAlign: 'center', color: 'accentInverted' }}>
                {info.icon}
                <Box my={2}>
                  {!isLoading ? (
                    <Text variant="sectionTitle" sx={{ fontWeight: '700' }}>
                      ${info.value}
                    </Text>
                  ) : (
                    <Skeleton height={32} width={200} />
                  )}
                </Box>

                <Text sx={{ color: 'text' }}>{info.title}</Text>
              </Box>
              {!!index && (
                <Box
                  // mx={3}
                  sx={{
                    display: ['none', 'block'],
                    fontSize: 5,
                    color: 'accentInverted',
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
      <StackedChainLogo chains={[ChainId.Mainnet, ChainId.Base]} />
      <Text sx={{ fontSize: [2, 3] }}>
        <Trans>On Ethereum & Base</Trans>
      </Text>
    </Box>
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
        <Trans>A new path to better money, already in motion</Trans>
      </Text>
      <Text as="p" px={[2, 0]} sx={{ fontSize: [2, 3] }} mt={[3, 4]}>
        <Trans>
          Reserve Protocol’s RToken Factory Contracts: A platform for creating
          currencies backed by an array of ERC20 collateral. Use Register to
          mint, stake and govern RTokens. Learn more at
        </Trans>{' '}
        <Link
          sx={{ textDecoration: 'underline', color: 'accent' }}
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
      <About />
      <ProtocolStats />
    </Flex>
  </Box>
)

export default Hero
