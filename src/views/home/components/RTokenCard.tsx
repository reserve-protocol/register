import { ListedToken } from 'hooks/useTokenList'
import { memo } from 'react'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import FacadeRead from 'abis/FacadeRead'
import { formatCurrency, truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { Address, formatEther, hexToString } from 'viem'
import { useContractReads } from 'wagmi'
import Skeleton from 'react-loading-skeleton'
import TokenLogo from 'components/icons/TokenLogo'
import { Button } from 'components'
import { ArrowRight } from 'react-feather'
import { Trans } from '@lingui/macro'
import ChainLogo from 'components/icons/ChainLogo'
import { CHAIN_TAGS } from 'utils/constants'
import { borderRadius } from 'theme'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'

interface Props extends BoxProps {
  token: ListedToken
}

const useBasketAPY = (
  marketCap: number,
  staked: number,
  basket: { id: string; symbol: string }[],
  distribution: Record<string, number>
) => {}

const useRTokenDistribution = (token: Address, chainId: number) => {
  return useContractReads({
    contracts: [
      {
        abi: FacadeRead,
        address: FACADE_ADDRESS[chainId],
        functionName: 'basketBreakdown',
        args: [token],
        chainId,
      },
      {
        abi: FacadeRead,
        address: FACADE_ADDRESS[chainId],
        functionName: 'backingOverview',
        args: [token],
        chainId,
      },
    ],
    allowFailure: false,
    select: (data) => {
      const [[erc20s, uoaShares, targets], [backing, overCollateralization]] =
        data

      const backingPercent = Math.min(
        100,
        Math.ceil(Number(formatEther(backing)) * 100)
      )
      const stakedPercent = Math.ceil(
        Number(formatEther(overCollateralization)) * 100
      )

      return {
        backing: backingPercent,
        staked: stakedPercent,
        collaterization: backingPercent + stakedPercent,
        collateralDistribution: erc20s.reduce(
          (acc: any, current: any, index: any) => ({
            ...acc,
            [current]: {
              share: truncateDecimals(+formatEther(uoaShares[index]) * 100, 4),
              targetUnit: hexToString(targets[index], { size: 32 }),
            },
          }),
          {}
        ),
      }
    },
  })
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      position: 'absolute',
      right: 0,
      top: 0,
      border: '2px dashed',
      borderColor: 'darkBorder',
      backgroundColor: 'background',
      borderRadius: borderRadius.boxes,
    }}
    p={2}
  >
    <ChainLogo chain={chain} />
    <Text ml="2">{CHAIN_TAGS[chain]}</Text>
  </Box>
)

const RTokenCard = ({ token, ...props }: Props) => {
  const distribution = useRTokenDistribution(token.id as Address, token.chain)

  return (
    <Card sx={{ backgroundColor: 'contentBackground' }} p={4} {...props}>
      <Box variant="layout.verticalAlign" sx={{ position: 'relative' }}>
        <ChainBadge chain={token.chain} />

        <Box
          pr={4}
          mr={4}
          sx={{
            flexShrink: 0,
            display: ['none', 'block'],
            borderRight: '1px solid',
            borderColor: 'darkBorder',
          }}
        >
          <Skeleton height={193} width={175} />
        </Box>
        <Box>
          <Box variant="layout.verticalAlign" mb={3}>
            <TokenLogo width="42px" src={token.logo} />
            <Box ml="3">
              <Text variant="sectionTitle">{token.symbol}</Text>
              <Text variant="legend" sx={{ fontSize: 1 }}>
                ${formatCurrency(token.price, 5)}
              </Text>
            </Box>
          </Box>
          <Box mb={1} pl={2} variant="layout.verticalAlign">
            <CollaterizationIcon />
            <Text ml="2" variant="legend">
              <Trans>Backing + Overcollaterization:</Trans>
            </Text>
            <Text ml="2" variant="strong">
              {distribution.data?.collaterization ?? 0}%
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
            <Button mt={3} mr={3} medium>
              Stake RSR - 123% Est. APY
            </Button>
            <Button mt={3} mr={3} medium variant="muted">
              Mint - 0% Est. APY
            </Button>
            <Button mt={3} mr={3} medium variant="transparent">
              Explore <ArrowRight size={16} />
            </Button>
            <Button mt={3} medium variant="transparent">
              Earn <ArrowRight size={16} />
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
