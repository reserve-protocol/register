import { FC, PropsWithChildren, memo, useMemo } from 'react'
import { Plus } from 'lucide-react'
import useSWR from 'swr'
import { Box, ButtonProps, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { erc20Abi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'

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
  const { data: supplies } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        chainId: ChainId.Mainnet,
        address: TOKEN_ADDRESS,
        functionName: 'totalSupply',
      },
      {
        abi: erc20Abi,
        chainId: ChainId.Mainnet,
        address: STAKE_TOKEN_ADDRESS,
        functionName: 'totalSupply',
      },
    ],
    allowFailure: false,
  })

  const { data: yieldsAPIData } = useSWR(
    'https://yields.reserve.org/pools',
    fetcher
  )

  const _basketAPY = useMemo(() => {
    const apiBasketAPY =
      yieldsAPIData?.rtokensBasketAPY?.[ChainId.Mainnet]?.dgnETH
    return apiBasketAPY || basketAPY
  }, [yieldsAPIData, basketAPY])

  const apy = useMemo(() => {
    if (!_basketAPY || !supplies) return '0%'

    const [tokenSupply, stakeTokenSupply] = supplies

    if (stakeTokenSupply === 0n) return '0%'

    const stakeAPY =
      (_basketAPY * 0.95 * +formatUnits(tokenSupply, 18)) /
      +formatUnits(stakeTokenSupply, 21)

    return `${stakeAPY.toFixed(1)}%`
  }, [_basketAPY, supplies])

  if (rTokenSymbol !== 'dgnETH') return <>{children}</>

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
