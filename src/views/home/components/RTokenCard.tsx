import { Trans } from '@lingui/macro'
import { Button } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import MoneyIcon from 'components/icons/MoneyIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { rTokenPoolsAtom } from 'state/pools/atoms'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { BRIDGED_RTOKENS, CHAIN_TAGS, ROUTES } from 'utils/constants'
import { getAddress } from 'viem'
import CollateralPieChartWrapper from 'views/overview/components/CollateralPieChartWrapper'
interface Props extends BoxProps {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      backgroundColor: 'rgba(0, 82, 255, 0.12)',
      border: '1px solid',
      borderColor: 'rgba(0, 82, 255, 0.20)',
      borderRadius: '50px',
      padding: '4px 8px',
      gap: 1,
    }}
  >
    <ChainLogo chain={chain} fontSize={12} />
    <Text sx={{ fontSize: 12 }}>{CHAIN_TAGS[chain]}</Text>
  </Box>
)

const RTokenCard = ({ token, ...props }: Props) => {
  const navigate = useNavigate()
  const pools = useAtomValue(rTokenPoolsAtom)
  const earnData = pools[getAddress(token.id)]

  const handleNavigate = (route: string) => {
    navigate(`${route}?token=${token.id}&chainId=${token.chain}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  const handleEarn = () => {
    const addresses = [token.id]

    if (BRIDGED_RTOKENS[token.chain]?.[token.id]) {
      for (const bridgeToken of BRIDGED_RTOKENS[token.chain]?.[token.id]) {
        addresses.push(bridgeToken.address)
      }
    }

    navigate(
      `${ROUTES.EARN}?underlying=${addresses.join(',')}&chainId=${token.chain}`
    )
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Card
      sx={{
        backgroundColor: 'contentBackground',
        borderRadius: '20px',
        borderBottom: '2px solid',
        borderColor: 'transparent',
        '&:hover': {
          borderColor: 'primary',
        },
        height: '316px',
      }}
      p={3}
      {...props}
    >
      <Box variant="layout.verticalAlign" sx={{ height: '100%' }}>
        <Box
          sx={{
            pr: 3,
            flexShrink: 0,
            display: ['none', 'block'],
            borderRight: '1px solid',
            borderColor: 'darkBorder',
          }}
        >
          <CollateralPieChartWrapper token={token} />
        </Box>

        <Box
          variant="layout.centered"
          px={5}
          py={3}
          sx={{
            flexGrow: 1,
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: 2,
            height: '100%',
          }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
            <ChainBadge chain={token.chain} />
          </Box>

          <Box variant="layout.centered" sx={{ alignItems: 'start', gap: 4 }}>
            <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
              <TokenLogo width={50} src={token.logo} />
              <Box variant="layout.centered" sx={{ alignItems: 'start' }}>
                <Text
                  sx={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }}
                >
                  {token.symbol}
                </Text>
                <Text variant="legend" sx={{ fontSize: 16 }}>
                  ${formatCurrency(token.price, 2)}
                </Text>
              </Box>
            </Box>

            <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
              <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                  <MoneyIcon />
                  <Text variant="legend">
                    <Trans>Market cap:</Trans>
                  </Text>
                </Box>
                <Text variant="strong">${formatCurrency(token.supply, 0)}</Text>
              </Box>
              <Box
                sx={{
                  height: '12px',
                  border: 'none',
                  borderRight: '1px solid',
                  borderColor: '#CCCCCC',
                  borderStyle: 'dashed',
                }}
              />
              <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                <CollaterizationIcon />
                <Text variant="legend">
                  <Trans>Backing + Overcollaterization:</Trans>
                </Text>
                <Text variant="strong" color="#333333">
                  {(token.backing + token.overcollaterization).toFixed(0)}%
                </Text>
              </Box>
            </Box>
            <Box
              variant="layout.verticalAlign"
              sx={{ flexWrap: 'wrap', gap: '12px' }}
            >
              <Button onClick={() => handleNavigate(ROUTES.ISSUANCE)} medium>
                {token.tokenApy
                  ? `${token.tokenApy.toFixed(1)}% Est. APY`
                  : 'Mint'}
              </Button>
              <Button
                onClick={() => handleNavigate(ROUTES.STAKING)}
                medium
                variant="muted"
              >
                Stake RSR{' '}
                {!!token.stakingApy && `- ${token.stakingApy.toFixed(1)}% APY`}
              </Button>

              <Button
                onClick={() => handleNavigate(ROUTES.OVERVIEW)}
                medium
                variant="transparent"
              >
                <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                  <Text>Explore</Text>
                  <ArrowRight size={16} />
                </Box>
              </Button>

              {!!earnData && (
                <Button onClick={handleEarn} medium variant="hover">
                  <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                    <Box
                      variant="layout.verticalAlign"
                      p="1"
                      sx={{
                        backgroundColor: 'rBlue',
                        borderRadius: 6,
                        color: 'white',
                      }}
                    >
                      <EarnNavIcon fontSize={20} />
                    </Box>
                    <Text>Earn - </Text>
                    <Text ml="1" variant="strong" sx={{ color: 'rBlue' }}>
                      {earnData.maxApy.toFixed(0)}% APY
                    </Text>
                    <ArrowRight size={16} />
                  </Box>
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
