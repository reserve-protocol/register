import TokenLogo from 'components/icons/TokenLogo'
import { useMemo } from 'react'
import { ArrowUpRight, ChevronRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Image, Text, useThemeUI } from 'theme-ui'
import { getTokenRoute } from 'utils'
import { ETHPLUS_ADDRESS, EUSD_ADDRESS, USD3_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'

const UseCases = () => {
  const navigate = useNavigate()
  const {
    theme: { breakpoints },
  } = useThemeUI()

  const useCases = useMemo(() => {
    const isMobile =
      window.innerWidth <= parseFloat(breakpoints?.[0] || '0') * 16

    const cases = [
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
        icon: <Image width={42} src="/imgs/defi_icons.png" />,
        link: ROUTES.EARN,
      },
      {
        title: 'ETH Yield',
        description:
          'Diversified bluechip liquid staking protocols with automated yield compounding & portfolio rebalancing.',
        icon: <TokenLogo width={24} src="/svgs/ethplus.svg" />,
        link: getTokenRoute(
          ETHPLUS_ADDRESS[ChainId.Mainnet],
          ChainId.Mainnet,
          ROUTES.OVERVIEW
        ),
      },
      {
        title: 'Censorship Resistant',
        description:
          'An overcollateralized stablecoin diversified across top lending protocols and centralized stablecoin issuers.',
        icon: <TokenLogo width={24} src="/svgs/eusd.svg" />,
        link: getTokenRoute(
          EUSD_ADDRESS[ChainId.Mainnet],
          ChainId.Mainnet,
          ROUTES.OVERVIEW
        ),
      },
    ]

    if (isMobile) {
      // swap 2nd and 3rd use cases
      const temp = cases[1]
      cases[1] = cases[2]
      cases[2] = temp
    }

    return cases
  }, [breakpoints, window.innerWidth])

  return (
    <Box sx={{ position: 'relative' }} px={[4, 3]}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 2 }}
        py={4}
      >
        <Text variant="sectionTitle">Discover the protocol</Text>
        <Box
          variant="layout.verticalAlign"
          sx={{
            gap: 1,
            cursor: 'pointer',
            ':hover': {
              filter: 'brightness(1.1)',
            },
            display: ['none', 'flex'],
          }}
          onClick={() => window.open('https://reserve.org/', '_blank')}
        >
          <Text variant="bold" color="#999" sx={{ fontSize: 3 }}>
            Learn about Reserve
          </Text>
          <ArrowUpRight color="#999" size={20} />
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
              gap: 1,
              pt: 4,
              pb: [4, index < 2 ? 4 : 0],
              pl: [3, index % 2 === 1 ? 4 : 0],
              pr: [3, index % 2 === 0 ? 4 : 0],
              cursor: 'pointer',
              mx: [-3, 0],
            }}
            onClick={() => navigate(link)}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{
                gap: 1,
                justifyContent: 'space-between',
                alignItems: ['start', 'center'],
              }}
            >
              <Box
                variant="layout.verticalAlign"
                sx={{
                  flexDirection: 'column',
                  alignItems: 'start',
                  gap: 3,
                }}
              >
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
      <Box
        variant="layout.verticalAlign"
        sx={{
          display: ['flex', 'none'],
          gap: 1,
          color: 'accentInverted',
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'border',
        }}
        mx={-4}
        px={4}
        py={4}
        onClick={() => window.open('https://reserve.org/', '_blank')}
      >
        <Text variant="bold" sx={{ fontSize: 3 }}>
          Learn about Reserve
        </Text>
        <ArrowUpRight size={20} />
      </Box>
    </Box>
  )
}

export default UseCases
