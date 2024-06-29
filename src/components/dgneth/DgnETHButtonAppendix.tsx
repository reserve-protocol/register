import { FC, PropsWithChildren, memo, useMemo } from 'react'
import { Plus } from 'react-feather'
import { Box, ButtonProps, Text } from 'theme-ui'
import { formatUnits } from 'viem'
import { erc20ABI, useContractReads } from 'wagmi'

type Props = {
  rTokenSymbol?: string
  basketAPY?: number
  borderColor?: string
  hideLabelOnMobile?: boolean
} & PropsWithChildren<ButtonProps>

const TOKEN_ADDRESS = '0x005F893EcD7bF9667195642f7649DA8163e23658'
const STAKE_TOKEN_ADDRESS = '0x5BDd1fA233843Bfc034891BE8a6769e58F1e1346'

const DgnETHButtonAppendix: FC<Props> = ({
  rTokenSymbol,
  basketAPY,
  borderColor = 'divaBorder',
  hideLabelOnMobile = false,
  children,
}) => {
  const { data: supplies } = useContractReads({
    contracts: [
      {
        abi: erc20ABI,
        address: TOKEN_ADDRESS,
        functionName: 'totalSupply',
      },
      {
        abi: erc20ABI,
        address: STAKE_TOKEN_ADDRESS,
        functionName: 'totalSupply',
      },
    ],
    allowFailure: false,
  })

  const apy = useMemo(() => {
    if (!basketAPY || !supplies) return '0%'

    const [tokenSupply, stakeTokenSupply] = supplies

    if (stakeTokenSupply === 0n) return '0%'

    const stakeAPY =
      (basketAPY * +formatUnits(tokenSupply, 18)) /
      +formatUnits(stakeTokenSupply, 21)

    return `${stakeAPY.toFixed(1)}%`
  }, [basketAPY])

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
