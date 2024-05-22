import TokenLogo from 'components/icons/TokenLogo'
import { ArrowRight, ArrowUpRight, ChevronRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Text } from 'theme-ui'
import { getTokenRoute } from 'utils'
import { ETHPLUS_ADDRESS, RGUSD_ADDRESS, USD3_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'

const UseCases = () => {
  const navigate = useNavigate()

  const useCases = [
    {
      title: 'USD Yield',
      description:
        'Diversified blue chip lending exposure + blue chip stables.',
      icon: <TokenLogo width={24} src="/svgs/usd3.svg" />,
      link: getTokenRoute(
        USD3_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
    {
      title: 'DeFi Yield',
      description:
        'Provide liquidity across DeFi & earn more with your RTokens.',
      icon: <TokenLogo width={24} src="/imgs/beefy.png" />,
      link: ROUTES.EARN,
    },
    {
      title: 'ETH Yield',
      description:
        'Diversified bluechip liquid staking protocols with Automated yield compounding & portfolio rebalancing.',
      icon: <TokenLogo width={24} src="/svgs/ethplus.svg" />,
      link: getTokenRoute(
        ETHPLUS_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
    {
      title: 'Incentive Games',
      description:
        'Overcollateralized stablecoin that directs its collateral basket revenue toward incentivizing rgUSD liquidity.',
      icon: <TokenLogo width={24} src="/svgs/rgusd.svg" />,
      link: getTokenRoute(
        RGUSD_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
  ]

  return (
    <Box sx={{ position: 'relative' }} px={[4, 3]}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 2 }}
        py={4}
      >
        <Text variant="sectionTitle">Discover the protocol</Text>
        <Box sx={{ display: ['none', 'flex'] }}>
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: 1,
              cursor: 'pointer',
              ':hover': {
                filter: 'brightness(1.1)',
              },
            }}
            onClick={() => window.open('https://reserve.org/', '_blank')}
          >
            <Text variant="bold" color="#999" sx={{ fontSize: 3 }}>
              Learn about Reserve
            </Text>
            <ArrowUpRight color="#999" size={20} />
          </Box>
        </Box>
      </Box>
      <Grid columns={['1fr', '1fr 1fr']} gap={0}>
        {useCases.map(({ title, description, icon, link }, index) => (
          <Box
            key={`${title}-${index}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: ['1px solid', index < 2 ? '1px solid' : 'none'],
              borderRight: ['none', index % 2 === 0 ? '1px solid' : 'none'],
              borderBottom: ['none', index < 2 ? '1px solid' : 'none'],
              borderColor: ['border', 'border'],
              gap: [2, 3],
              py: [4, 4],
              pl: [3, index % 2 === 1 ? 4 : 0],
              pr: [3, index % 2 === 0 ? 4 : 0],
              cursor: 'pointer',
              mx: [-3, 0],
            }}
            onClick={() => navigate(link)}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 1, justifyContent: 'space-between' }}
            >
              <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                {icon}
                <Text sx={{ fontWeight: 'bold', fontSize: 3 }}>{title}</Text>
              </Box>
              <ChevronRight color="#999" size={16} />
            </Box>
            <Box>
              <Text sx={{ color: 'secondaryText' }}>{description}</Text>
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}

export default UseCases
