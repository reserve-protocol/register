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
import {
  CHAIN_TO_NETWORK,
  capitalize,
  supportedChainList,
} from 'utils/constants'
import useProtocolMetrics from '../hooks/useProtocolMetrics'
import HistoricalTVL from './HistoricalTVL'

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

const Hero = () => (
  <Box sx={{ position: 'relative' }}>
    <Flex
      sx={{
        flexDirection: 'column',
        maxWidth: '95em',
        borderRadius: '14px',
        backgroundColor: 'contentBackground',
      }}
      mx="auto"
      mt={[1, 7]}
    >
      <Box
        variant="layout.verticalAlign"
        p={4}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        <StackedChainLogo chains={supportedChainList} />
        <Text variant="bold">
          The <Text color="primary">Reserve Protocol</Text> on
          {supportedChainList.map(
            (chainId, index) =>
              ` ${capitalize(CHAIN_TO_NETWORK[chainId])}${
                index >= supportedChainList.length - 2
                  ? index === supportedChainList.length - 1
                    ? ''
                    : ' & '
                  : ','
              }`
          )}
        </Text>
      </Box>
      <Flex>
        <Box
          p={4}
          sx={{
            flexGrow: '12',
            borderRight: '1px solid',
            borderColor: 'border',
          }}
        >
          Flex
        </Box>
        <Box p={4} sx={{ flexGrow: '10' }}>
          Box
        </Box>
      </Flex>
      {/* <ProtocolStats /> */}
      <Box sx={{ height: 400 }}>
        <HistoricalTVL />
      </Box>
    </Flex>
  </Box>
)

export default Hero
