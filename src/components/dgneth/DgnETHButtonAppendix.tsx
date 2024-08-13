import { FC, PropsWithChildren, memo, useMemo } from 'react'
import { Plus } from 'react-feather'
import { Box, ButtonProps, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { formatUnits } from 'viem'
import { useContractReads } from 'wagmi'

type Props = {
  rTokenSymbol?: string
  basketAPY?: number
  borderColor?: string
  hideLabelOnMobile?: boolean
} & PropsWithChildren<ButtonProps>

const TOKEN_ADDRESS = '0x005F893EcD7bF9667195642f7649DA8163e23658'
const STAKE_TOKEN_ADDRESS = '0x5BDd1fA233843Bfc034891BE8a6769e58F1e1346'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const DgnETHButtonAppendix: FC<Props> = ({
  rTokenSymbol,
  basketAPY,
  borderColor = 'divaBorder',
  hideLabelOnMobile = false,
  children,
}) => {
  const isEnabled = rTokenSymbol === 'dgnETH'
  const { data } = useContractReads({
    contracts: [
      {
        abi: [
          {
            type: 'function',
            name: 'rewardTracker',
            inputs: [],
            outputs: [
              {
                name: 'rewardPeriodStart',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'rewardPeriodEnd',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'rewardAmount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
            stateMutability: 'view',
          },
        ] as const,
        chainId: ChainId.Mainnet,
        address: STAKE_TOKEN_ADDRESS,
        functionName: 'rewardTracker',
      },
      {
        abi: [
          {
            type: 'function',
            name: 'totalAssets',
            inputs: [],
            outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
            stateMutability: 'view',
          },
        ] as const,
        chainId: ChainId.Mainnet,
        address: STAKE_TOKEN_ADDRESS,
        functionName: 'totalAssets',
      },
    ],
    allowFailure: false,
    enabled: isEnabled,
  })

  const apy = useMemo(() => {
    if (!data) return '--%'

    const rewards = +formatUnits(data[0][2], 21)
    const assets = +formatUnits(data[1], 21)

    return ((rewards / assets) * 52 * 100).toFixed(1) + '%'
  }, [data])

  if (!isEnabled) return <>{children}</>

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        border: '2px solid',
        borderColor: borderColor,
        borderRadius: '14px 46px 46px 14px',
        gap: 2,
        cursor: 'pointer',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation()
          window.open('https://degeneth.com/', '_blank')
        }
      }}
    >
      {children}
      <Box
        variant="layout.verticalAlign"
        pr="12px"
        sx={{
          gap: 1,
        }}
        onClick={() => {
          window.open('https://degeneth.com/', '_blank')
        }}
      >
        <Plus strokeWidth={1.2} size={16} />
        <Text color="diva" sx={{ fontWeight: 'bold' }}>
          {apy}
        </Text>
        <Text
          sx={{
            display: [hideLabelOnMobile ? 'none' : 'flex', 'flex'],
            fontSize: [1, 'inherit'],
          }}
        >
          APY on degeneth.com
        </Text>
      </Box>
    </Box>
  )
}

export default memo(DgnETHButtonAppendix)
