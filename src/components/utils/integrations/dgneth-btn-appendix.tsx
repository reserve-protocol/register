import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { FC, PropsWithChildren, memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChainId } from 'utils/chains'
import { erc20Abi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'

type Props = {
  rTokenSymbol?: string
  basketAPY?: number
  borderColor?: string
  hideLabelOnMobile?: boolean
  children?: React.ReactNode
}

const TOKEN_ADDRESS = '0x005F893EcD7bF9667195642f7649DA8163e23658'
const STAKE_TOKEN_ADDRESS = '0x5BDd1fA233843Bfc034891BE8a6769e58F1e1346'

const DgnETHButtonAppendix: FC<Props> = ({
  rTokenSymbol,
  basketAPY,
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

  const { data: yieldsAPIData } = useQuery({
    queryKey: ['yields-pools'],
    queryFn: () => fetch('https://yields.reserve.org/pools').then((res) => res.json()),
  })

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
    <div
      className="flex items-center border-2 border-border rounded-[14px_46px_46px_14px] gap-2 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation()
          window.open('https://degeneth.com/', '_blank')
        }
      }}
    >
      {children}
      <div
        className="flex items-center pr-3 gap-1"
        onClick={() => {
          window.open('https://degeneth.com/', '_blank')
        }}
      >
        <Plus strokeWidth={1.2} size={16} />
        <span className="text-primary font-bold">{apy}</span>
        <span
          className={cn(
            'whitespace-nowrap',
            hideLabelOnMobile ? 'hidden sm:flex' : 'flex',
            'text-sm sm:text-base'
          )}
        >
          APY on degeneth.com
        </span>
      </div>
    </div>
  )
}

export default memo(DgnETHButtonAppendix)
