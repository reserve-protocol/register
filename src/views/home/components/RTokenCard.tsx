import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from 'components/button/CopyValue'
import ChainLogo from 'components/icons/ChainLogo'
import ChevronRight from 'components/icons/ChevronRight'
import CircleIcon from 'components/icons/CircleIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import EarnIcon from 'components/icons/EarnIcon'
import MoneyIcon from 'components/icons/MoneyIcon'
import PegIcon from 'components/icons/PegIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { FC, memo, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { rTokenPoolsAtom } from 'state/pools/atoms'
import { mediumButton } from 'theme'
import { Box, BoxProps, Card, Divider, Link, Text } from 'theme-ui'
import { formatCurrency, shortenString } from 'utils'
import { BRIDGED_RTOKENS, CHAIN_TAGS, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { getAddress } from 'viem'
import CollateralPieChartTooltip from 'views/overview/components/CollateralPieChartTooltip'
import CollateralPieChartWrapper from 'views/overview/components/CollateralPieChartWrapper'

interface Props extends BoxProps {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      display: ['none', 'flex'],
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

const VerticalDivider: FC<BoxProps> = ({ sx, ...props }) => (
  <Box
    sx={{
      height: '12px',
      border: 'none',
      borderRight: '1px solid',
      borderColor: '#4C4C4C',
      borderStyle: 'dashed',
      ...sx,
    }}
    {...props}
  />
)

const EarnButton = ({ token, sx, ...props }: Props) => {
  const navigate = useNavigate()
  const pools = useAtomValue(rTokenPoolsAtom)
  const earnData = pools[getAddress(token.id)]

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

  if (!earnData) return null

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1, ...sx }} {...props}>
      <VerticalDivider sx={{ display: ['block', 'none'] }} />
      <Button
        onClick={(e) => {
          e.stopPropagation()
          handleEarn()
        }}
        variant="hover"
        sx={{
          width: ['100%', 'fit-content'],
          ...mediumButton,
          pr: [0, 3],
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ gap: [1, 2], justifyContent: ['space-between', 'start'] }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <EarnIcon />
            <Text>Earn: </Text>
            <Text
              ml="1"
              variant="strong"
              sx={{ color: 'rBlue', fontWeight: 700 }}
            >
              {earnData.maxApy.toFixed(0)}% APY
            </Text>
          </Box>
          <Box sx={{ display: ['none', 'block'] }}>
            <ChevronRight color="#2150A9" />
          </Box>
          <Box sx={{ display: ['block', 'none'] }}>
            <ChevronRight color="#2150A9" width={16} height={16} />
          </Box>
        </Box>
      </Button>
    </Box>
  )
}

const MobileCollateralInfo = ({ token }: Props) => {
  const [collapsed, setCollapsed] = useState(true)
  const navigate = useNavigate()

  const handleNavigate = (route: string) => {
    navigate(`${route}?token=${token.id}&chainId=${token.chain}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box
      variant="layout.centered"
      sx={{
        gap: 2,
        alignItems: 'start',
        justifyContent: 'start',
        display: ['block', 'none'],
        width: '100%',
      }}
    >
      <Divider sx={{ width: '100%' }} />
      <Box
        variant="layout.verticalAlign"
        sx={{
          gap: 2,
          display: ['flex', 'none'],
          justifyContent: 'space-between',
          width: '100%',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <CollaterizationIcon />
          <Text variant="legend">
            <Trans>Backing + Overcollaterization:</Trans>
          </Text>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="strong" color="#333333">
            {(token.backing + token.overcollaterization).toFixed(0)}%
          </Text>
          {collapsed ? (
            <ChevronDown fontSize={16} color="#808080" />
          ) : (
            <ChevronUp fontSize={16} color="#808080" />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          overflow: 'hidden',
          maxHeight: collapsed ? '0px' : '1000px',
          transition: 'max-height 0.4s ease-in-out',
        }}
      >
        <Box
          variant="layout.centered"
          sx={{ gap: 2, width: '100%', display: ['flex', 'none'] }}
        >
          <Divider sx={{ width: '100%' }} />
          <CollateralPieChartTooltip token={token} />
          <Button
            medium
            onClick={() => handleNavigate(ROUTES.OVERVIEW)}
            variant="transparent"
            fullWidth
            px={3}
            py={2}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 2, justifyContent: 'center' }}
            >
              <CollaterizationIcon />
              <Text sx={{ fontWeight: 700 }}>{t`Full exposure view`}</Text>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

const RTokenCard = ({ token, ...props }: Props) => {
  const navigate = useNavigate()

  const handleNavigate = (route: string) => {
    navigate(`${route}?token=${token.id}&chainId=${token.chain}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Card
      sx={{
        backgroundColor: 'contentBackground',
        borderRadius: ['10px', '20px'],
        borderBottom: '2px solid',
        borderColor: 'transparent',
        '&:hover': {
          borderColor: ['transparent', 'primary'],
        },
        height: ['100%', '316px'],
        cursor: 'pointer',
        mx: [2, 0],
        transition: 'border-color 0.3s ease',
      }}
      p={[0, 3]}
      onClick={(e) => {
        e.stopPropagation()
        handleNavigate(ROUTES.OVERVIEW)
      }}
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
          pl={[3, 5]}
          pr={3}
          py={3}
          sx={{
            flexGrow: 1,
            alignItems: 'start',
            justifyContent: ['start', 'space-between'],
            gap: 2,
            height: '100%',
          }}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, justifyContent: 'space-between', width: '100%' }}
          >
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <TokenLogo
                width={32}
                src={token.logo}
                sx={{ display: ['block', 'none'], height: '32px' }}
              />
              <ChainBadge chain={token.chain} />
              <Box sx={{ display: ['block', 'none'] }}>
                <ChainLogo chain={token.chain} fontSize={12} />
              </Box>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <Text sx={{ fontSize: 14 }} color="#666666">
                {shortenString(token.id)}
              </Text>
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <CopyValue color="#666666" value={token.id} size={14} />
                <Link
                  href={getExplorerLink(
                    token.id,
                    token.chain,
                    ExplorerDataType.TOKEN
                  )}
                  target="_blank"
                  sx={{ display: 'flex', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight color="#666666" size={14} />
                </Link>
              </Box>
            </Box>
          </Box>

          <Box
            variant="layout.centered"
            sx={{ alignItems: 'start', gap: [2, 4], width: '100%' }}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{
                gap: '12px',
                justifyContent: ['space-between', 'start'],
                flexGrow: 1,
                width: '100%',
              }}
            >
              <TokenLogo
                width={50}
                src={token.logo}
                sx={{ display: ['none', 'block'] }}
              />
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
              <Box sx={{ display: ['block', 'none'] }}>
                <ChevronRight width={16} height={16} />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: ['column-reverse', 'column'],
                gap: [3, 4],
                width: '100%',
              }}
            >
              <Box
                variant="layout.verticalAlign"
                sx={{ gap: [2, 3], width: '100%' }}
              >
                <Box sx={{ display: ['flex', 'none'] }}>
                  <MoneyIcon />
                </Box>
                <Box
                  variant="layout.verticalAlign"
                  sx={{ gap: [0, 2], flexDirection: ['column', 'row'] }}
                  mr={[2, 0]}
                >
                  <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                    <Box sx={{ display: ['none', 'flex'] }}>
                      <MoneyIcon />
                    </Box>
                    <Text variant="legend" sx={{ whiteSpace: 'nowrap' }}>
                      <Trans>Market cap:</Trans>
                    </Text>
                  </Box>
                  <Text variant="strong">
                    ${formatCurrency(token.supply, 0)}
                  </Text>
                </Box>
                <VerticalDivider sx={{ display: ['none', 'block'] }} />
                <Box
                  variant="layout.verticalAlign"
                  sx={{ gap: 2, display: ['none', 'flex'] }}
                >
                  <PegIcon />
                  <Text variant="legend">
                    <Trans>Peg:</Trans>
                  </Text>
                  <Text variant="strong">{token.targetUnits}</Text>
                </Box>
                <VerticalDivider sx={{ display: ['none', 'block'] }} />
                <Box
                  variant="layout.verticalAlign"
                  sx={{ gap: 2, display: ['none', 'flex'] }}
                >
                  <CollaterizationIcon />
                  <Text variant="legend">
                    <Trans>Backing + Overcollaterization:</Trans>
                  </Text>
                  <Text variant="strong" color="#333333">
                    {(token.backing + token.overcollaterization).toFixed(0)}%
                  </Text>
                </Box>
                <EarnButton
                  token={token}
                  sx={{ display: ['flex', 'none'], flexGrow: 1 }}
                />
              </Box>
              <Box
                variant="layout.verticalAlign"
                sx={{ flexWrap: 'wrap', gap: [2, '12px'] }}
                mt={[0, 2]}
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNavigate(ROUTES.ISSUANCE)
                  }}
                  medium
                >
                  {token.tokenApy
                    ? `${token.tokenApy.toFixed(1)}% Est. APY`
                    : 'Mint'}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNavigate(ROUTES.STAKING)
                  }}
                  medium
                  variant="muted"
                >
                  <Box
                    variant="layout.verticalAlign"
                    sx={{ gap: 2, fontWeight: 700 }}
                  >
                    <Text>
                      Stake RSR{' '}
                      {!!token.stakingApy &&
                        `- ${token.stakingApy.toFixed(1)}%`}
                    </Text>
                    <Text color="lightText">{t`Est. APY`}</Text>
                  </Box>
                </Button>

                <EarnButton token={token} sx={{ display: ['none', 'block'] }} />
              </Box>
            </Box>
          </Box>
          <MobileCollateralInfo token={token} />
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
