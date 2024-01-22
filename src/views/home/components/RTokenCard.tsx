import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo, useMemo } from 'react'
import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { rTokenPoolsAtom } from 'state/pools/atoms'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { formatCurrency, stringToColor } from 'utils'
import { BRIDGED_RTOKENS, CHAIN_TAGS, ROUTES } from 'utils/constants'
import { getAddress } from 'viem'
import CollateralPieChart from 'views/overview/components/CollateralPieChart'
import cms from 'utils/cms'
import { MouseoverTooltipContent } from 'components/tooltip'
import CircleIcon from 'components/icons/CircleIcon'
import StakedIcon from 'components/icons/StakedIcon'
import Help from 'components/help'
interface Props extends BoxProps {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      position: 'absolute',
      right: 0,
      top: 0,
      border: '1px solid',
      borderColor: 'darkBorder',
      borderRadius: '6px',
      padding: '4px 8px',
    }}
  >
    <ChainLogo chain={chain} />
    <Text ml="1">{CHAIN_TAGS[chain]}</Text>
  </Box>
)

const RTokenCard = ({ token, ...props }: Props) => {
  const navigate = useNavigate()
  const pools = useAtomValue(rTokenPoolsAtom)
  const earnData = pools[getAddress(token.id)]
  const chartData = useMemo(
    () =>
      token.collaterals.map((c) => {
        const cmsCollateral = cms.collaterals.find(
          (collateral) =>
            collateral.chain === token.chain && collateral.symbol === c.symbol
        )
        const cmsProject = cms.projects.find(
          (project) => project.name === cmsCollateral?.project
        )
        return {
          name: c.symbol,
          value:
            +token.collateralDistribution[c.id.toLowerCase()]?.dist * 100 ?? 0,
          color: cmsCollateral?.color || stringToColor(c.id),
          project: cmsProject?.label || 'GENERIC',
          projectColor: cmsProject?.color || 'gray',
        }
      }),
    []
  )

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
      sx={{ backgroundColor: 'contentBackground', borderRadius: '20px' }}
      p={3}
      {...props}
    >
      <Box variant="layout.verticalAlign" sx={{ position: 'relative' }}>
        <ChainBadge chain={token.chain} />

        <Box
          sx={{
            pr: 3,
            flexShrink: 0,
            display: ['none', 'block'],
            borderRight: '1px solid',
            borderColor: 'darkBorder',
          }}
        >
          <MouseoverTooltipContent
            content={
              <Card sx={{ width: 320, border: '1px solid black' }}>
                <Text sx={{ fontWeight: 400 }} variant="legend">
                  <Trans>Network</Trans>
                </Text>
                <Text variant="legend" sx={{ fontSize: 1 }}>
                  <Trans>
                    The configured network is different from the wallet selected
                    network. Change your network in the connected wallet.
                  </Trans>
                </Text>
              </Card>
            }
          >
            <Box p={2}>
              <CollateralPieChart
                data={chartData}
                logo={token.logo}
                staked={+token.overcollaterization.toFixed(2).toString()}
                topInformation={
                  <Box
                    p={2}
                    variant="layout.verticalAlign"
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                      <CircleIcon />
                      <Text sx={{ fontSize: 14 }}>{t`Backing`}</Text>
                    </Box>
                    <Box>
                      <Text sx={{ fontSize: 14, fontWeight: 700 }}>100%</Text>
                    </Box>
                  </Box>
                }
                bottomInformation={
                  <Box
                    p={2}
                    variant="layout.verticalAlign"
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                      <StakedIcon />
                      <Text sx={{ fontSize: 14 }}>{t`Stacked RSR`}</Text>
                    </Box>
                    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                      <Text sx={{ fontSize: 14, fontWeight: 700 }}>50%</Text>
                      <Help content={t`Staked RSR overcollateralization`} />
                    </Box>
                  </Box>
                }
              />
            </Box>
          </MouseoverTooltipContent>
        </Box>

        <Box ml={4}>
          <Box variant="layout.verticalAlign" mb={3}>
            <TokenLogo width="42px" src={token.logo} />
            <Box ml="3">
              <Text variant="sectionTitle">{token.symbol}</Text>
              <Text variant="legend" sx={{ fontSize: 1 }}>
                ${formatCurrency(token.price, 2)}
              </Text>
            </Box>
          </Box>
          <Box mb={1} pl={2} variant="layout.verticalAlign">
            <CollaterizationIcon />
            <Text ml="2" variant="legend">
              <Trans>Backing + Overcollaterization:</Trans>
            </Text>
            <Text ml="2" variant="strong">
              {(token.backing + token.overcollaterization).toFixed(0)}%
            </Text>
          </Box>
          <Box pl="2" variant="layout.verticalAlign">
            <Text variant="strong" pl="1" sx={{ width: '16px' }}>
              $
            </Text>
            <Text ml="2" variant="legend">
              <Trans>Market cap:</Trans>
            </Text>
            <Text ml="2" variant="strong">
              ${formatCurrency(token.supply, 0)}
            </Text>
          </Box>
          <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
            <Button
              onClick={() => handleNavigate(ROUTES.ISSUANCE)}
              mt={3}
              mr={3}
              medium
            >
              {token.tokenApy ? `${token.tokenApy.toFixed(1)}% APY` : 'Mint'}
            </Button>
            <Button
              onClick={() => handleNavigate(ROUTES.STAKING)}
              mt={3}
              mr={3}
              medium
              variant="muted"
            >
              Stake RSR{' '}
              {!!token.stakingApy && `- ${token.stakingApy.toFixed(1)}% APY`}
            </Button>

            <Button
              onClick={() => handleNavigate(ROUTES.OVERVIEW)}
              mt={3}
              mr={3}
              medium
              variant="transparent"
            >
              <Box variant="layout.verticalAlign">
                <Text mr={3}>Explore</Text> <ArrowRight size={16} />
              </Box>
            </Button>

            {!!earnData && (
              <Button onClick={handleEarn} mt={3} mr={3} medium variant="hover">
                <Box variant="layout.verticalAlign">
                  <Box
                    variant="layout.verticalAlign"
                    p="1"
                    mr={2}
                    sx={{
                      backgroundColor: 'rBlue',
                      borderRadius: 6,
                      color: 'white',
                    }}
                  >
                    <EarnNavIcon fontSize={20} />
                  </Box>
                  <Text>Earn - </Text>
                  <Text ml="1" mr={3} variant="strong" sx={{ color: 'rBlue' }}>
                    {earnData.maxApy.toFixed(0)}% APY
                  </Text>
                  <ArrowRight size={16} />
                </Box>
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
