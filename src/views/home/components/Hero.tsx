import { t } from '@lingui/macro'
import Help from 'components/help'
import LeafIcon from 'components/icons/LeafIcon'
import ShieldIcon from 'components/icons/ShieldIcon'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import TreeIcon from 'components/icons/TreeIcon'
import { ArrowUpRight } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Grid, Text } from 'theme-ui'
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
    data: {
      marketCap,
      rsrStakedUSD,
      rTokenAnnualizedRevenue,
      rsrStakerAnnualizedRevenue,
    },
    isLoading,
  } = useProtocolMetrics()

  const statInfo = [
    {
      icon: <TreeIcon />,
      value: formatCurrency(marketCap, 1, {
        notation: 'compact',
        compactDisplay: 'short',
      }),
      valueLong: formatCurrency(marketCap, 0),
      title: t`RToken Market Cap`,
      tooltip: t`The total value of all RToken in circulation`,
    },
    {
      icon: <ShieldIcon />,
      value: formatCurrency(rsrStakedUSD, 1, {
        notation: 'compact',
        compactDisplay: 'short',
      }),
      valueLong: formatCurrency(rsrStakedUSD, 0),
      title: t`First-loss RSR Capital`,
      tooltip: t`The total value of all RSR staked in the protocol`,
    },
    {
      icon: <LeafIcon />,
      value: formatCurrency(rTokenAnnualizedRevenue, 1, {
        notation: 'compact',
        compactDisplay: 'short',
      }),
      valueLong: formatCurrency(rTokenAnnualizedRevenue, 0),
      title: t`Annualized RToken Revenue`,
      tooltip: t`The revenue generated by the protocol from RToken holders. Calculation based on the last 10 days revenue.`,
    },
    {
      icon: <LeafIcon />,
      value: formatCurrency(rsrStakerAnnualizedRevenue, 1, {
        notation: 'compact',
        compactDisplay: 'short',
      }),
      valueLong: formatCurrency(rsrStakerAnnualizedRevenue, 0),
      title: t`Annualized RSR Staker Revenue`,
      tooltip: t`The revenue generated by the protocol from RSR stakers. Calculation based on the last 10 days revenue.`,
    },
  ]

  return (
    <Grid
      columns={['1fr 1fr 1fr 1fr', '1fr 1fr']}
      sx={{
        overflowX: 'auto',
        '::-webkit-scrollbar': {
          display: 'none',
        },
        gap: 0,
      }}
    >
      {statInfo.map(({ title, value, valueLong, icon, tooltip }, index) => (
        <Box
          key={title}
          variant="layout.verticalAlign"
          sx={{
            display: 'flex',
            flexDirection: ['column', 'row'],
            alignItems: ['start', 'center'],
            borderTop: ['none', index < 2 ? '1px solid' : 'none'],
            borderRight: ['none', index % 2 === 0 ? '1px solid' : 'none'],
            borderBottom: ['none', '1px solid'],
            borderColor: ['darkBorder', 'darkBorder'],
            gap: [0, 3],
            py: 4,
            pl: [index === 0 ? 4 : 3, 4],
            pr: [index === statInfo.length - 1 ? 4 : 3, 4],
            pb: [3, 4],
            minWidth: ['auto', 0],
          }}
        >
          {icon}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              mt: [3, 0],
            }}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 2, justifyContent: 'space-between' }}
            >
              <Text
                sx={{
                  color: 'secondaryText',
                  whiteSpace: ['nowrap', 'normal'],
                }}
              >
                {title}
              </Text>
              <Help content={tooltip} sx={{ display: ['flex', 'none'] }} />
            </Box>
            <Box>
              {!isLoading ? (
                <>
                  <Text
                    variant="sectionTitle"
                    sx={{ fontWeight: '700', display: ['none', 'inline'] }}
                  >
                    ${value}
                  </Text>
                  <Text
                    variant="sectionTitle"
                    sx={{ fontWeight: '700', display: ['inline', 'none'] }}
                  >
                    ${valueLong}
                  </Text>
                </>
              ) : (
                <Skeleton height={32} width={84} />
              )}
            </Box>
          </Box>
          <Help content={tooltip} sx={{ display: ['none', 'block'] }} />
        </Box>
      ))}
    </Grid>
  )
}

const HeroHeader = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      pt={[0, 4]}
      px={[3, 4]}
      pb={4}
      sx={{
        borderBottom: ['1px solid', 'none'],
        borderColor: ['border', 'border'],
        justifyContent: 'space-between',
        gap: 2,
        fontSize: [2, 3],
      }}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{
          flexDirection: ['row', 'column'],
          alignItems: ['center', 'flex-start'],
          gap: [0, 2],
        }}
      >
        <StackedChainLogo chains={supportedChainList} />
        <Text>
          <Text sx={{ display: ['none', 'inline'] }}>The </Text>
          <Text color="accentInverted">
            Reserve <Text sx={{ display: ['none', 'inline'] }}>protocol </Text>
          </Text>
          on
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
      <Box
        variant="layout.verticalAlign"
        sx={{
          gap: 1,
          cursor: 'pointer',
          ':hover': {
            filter: 'brightness(1.1)',
          },
          display: ['none', 'flex'],
          mt: [0, 'auto'],
        }}
        onClick={() =>
          window.open(
            'https://dune.com/reserve-protocol/reserve-protocol-overview',
            '_blank'
          )
        }
      >
        <Text variant="bold" color="#999">
          Full dashboard
        </Text>
        <ArrowUpRight color="#999" size={16} />
      </Box>
    </Box>
  )
}

const HeroTVL = () => {
  const {
    data: { tvl },
    isLoading,
  } = useProtocolMetrics()

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        color: 'accentInverted',
        gap: 1,
      }}
      px={[3, 4]}
      pt={5}
    >
      <Text sx={{ fontSize: 4 }}>TVL in Reserve</Text>

      {!isLoading ? (
        <Text variant="bold" sx={{ fontSize: [5, 6] }}>
          ${formatCurrency(tvl, 0)}
        </Text>
      ) : (
        <Box>
          <Box sx={{ display: ['none', 'flex'] }}>
            <Skeleton
              height={52}
              width={300}
              style={{ marginBottom: '16px' }}
            />
          </Box>
          <Box sx={{ display: ['flex', 'none'] }}>
            <Skeleton
              height={40}
              width={200}
              style={{ marginBottom: '16px' }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

const MobileDuneLink = () => {
  return (
    <Box
      pt={1}
      pb={4}
      px={4}
      variant="layout.verticalAlign"
      sx={{
        gap: 1,
        cursor: 'pointer',
        color: 'accentInverted',
        display: ['flex', 'none'],
        justifyContent: 'space-between',
      }}
      onClick={() =>
        window.open(
          'https://dune.com/reserve-protocol/reserve-protocol-overview',
          '_blank'
        )
      }
    >
      <Text variant="bold">Full Dune Dashboard</Text>
      <ArrowUpRight size={16} />
    </Box>
  )
}

const Hero = () => (
  <Box
    sx={{
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      minHeight: [560, 480],
    }}
  >
    <Flex
      sx={{
        position: 'relative',
        flexDirection: 'column',
        borderRadius: [0, '14px'],
        backgroundColor: ['none', 'reserveBackground'],
        height: '100%',
        overflow: 'hidden',
      }}
      mx="auto"
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column-reverse',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: ['block', 'none'] }}>
          <HeroHeader />
        </Box>
        <Box
          sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}
          px={[2, 3]}
          pt={2}
        >
          <HeroTVL />
          <HistoricalTVL />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <ProtocolStats />
        <Box sx={{ display: ['none', 'block'] }}>
          <HeroHeader />
        </Box>
      </Box>
      <MobileDuneLink />
    </Flex>
  </Box>
)

export default Hero
