import { ListedToken } from 'hooks/useTokenList'
import { memo } from 'react'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import FacadeRead from 'abis/FacadeRead'
import { formatCurrency, truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { Address, formatEther, hexToString } from 'viem'
import { useContractReads } from 'wagmi'
import Skeleton from 'react-loading-skeleton'

interface Props extends BoxProps {
  token: ListedToken
}

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

      return {
        backing: Math.min(100, Math.ceil(Number(formatEther(backing)) * 100)),
        staked: Math.ceil(Number(formatEther(overCollateralization)) * 100),
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

const RTokenCard = ({ token, ...props }: Props) => {
  const distribution = useRTokenDistribution(token.id as Address, token.chain)

  console.log('dist', distribution)

  return (
    <Card sx={{ backgroundColor: 'contentBackground' }} {...props}>
      <Box variant="layout.verticalAlign">
        <Skeleton height={193} width={175} />
        <Box ml={5}>
          <Box variant="layout.verticalAlign">
            <Box>
              <Text variant="sectionTitle">{token.symbol}</Text>
              <Text variant="legend" sx={{ fontSize: 1 }}>
                {formatCurrency(token.price, 5)}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
