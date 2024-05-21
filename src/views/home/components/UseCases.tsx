import MoneyIcon from 'components/icons/MoneyIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ArrowRight, ChevronRight } from 'react-feather'
import { NavLink, useNavigate } from 'react-router-dom'
import { Box, Grid, Text } from 'theme-ui'
import { getTokenRoute } from 'utils'
import {
  ETHPLUS_ADDRESS,
  EUSD_ADDRESS,
  RGUSD_ADDRESS,
  USD3_ADDRESS,
} from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'

const UseCases = () => {
  const navigate = useNavigate()

  const useCases = [
    {
      title: 'USD Yield',
      description:
        'Diversified blue chip lending exposure + blue chip stables.',
      icon: <TokenLogo src="/svgs/usd3.svg" />,
      link: getTokenRoute(
        USD3_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
    {
      title: 'USD Stablecoins',
      description: 'Fully collateralized US-dollar stablecoins.',
      icon: <TokenLogo src="/svgs/eusd.svg" />,
      link: getTokenRoute(
        EUSD_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
    {
      title: 'ETH Yield',
      description:
        'Diversified bluechip liquid staking protocols with Automated yield compounding & portfolio rebalancing.',
      icon: <TokenLogo src="/svgs/ethplus.svg" />,
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
      icon: <TokenLogo src="/svgs/rgusd.svg" />,
      link: getTokenRoute(
        RGUSD_ADDRESS[ChainId.Mainnet],
        ChainId.Mainnet,
        ROUTES.OVERVIEW
      ),
    },
  ]

  return (
    <Box sx={{ position: 'relative' }} px={3}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 2 }}
        py={4}
      >
        <Text variant="title" sx={{ fontWeight: 'bold' }}>
          RTokens for your needs
        </Text>
        <Box sx={{ display: ['none', 'flex'] }}>
          <NavLink
            to={ROUTES.COMPARE}
            style={{
              textDecoration: 'none',
            }}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{
                gap: 1,
                cursor: 'pointer',
                ':hover': {
                  filter: 'brightness(1.1)',
                },
              }}
            >
              <Text variant="bold" color="#999">
                All RTokens
              </Text>
              <ArrowRight color="#999" size={16} />
            </Box>
          </NavLink>
        </Box>
      </Box>
      <Grid columns={['1fr', '1fr 1fr']} gap={0}>
        {useCases.map(({ title, description, icon, link }, index) => (
          <Box
            key={`${title}-${index}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: ['1.5px solid', index < 2 ? '1.5px solid' : 'none'],
              borderRight: ['none', index % 2 === 0 ? '1.5px solid' : 'none'],
              borderBottom: ['none', index < 2 ? '1.5px solid' : 'none'],
              borderColor: ['border', 'border'],
              gap: [2, 3],
              py: [4, 4],
              pl: [3, index % 2 === 1 ? 4 : 0],
              pr: [3, index % 2 === 0 ? 4 : 0],
              cursor: 'pointer',
              minHeight: [0, '164px'],
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
                <Text sx={{ fontWeight: 'bold' }}>{title}</Text>
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
