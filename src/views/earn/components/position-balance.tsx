import { cn } from '@/lib/utils'
import { walletAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { useAtomValue } from 'jotai'
import { Lock, LockOpen } from 'lucide-react'
import { Address, formatUnits } from 'viem'
import { useBalance } from 'wagmi'

const PositionBalance = ({
  address,
  chain,
  symbol,
  price,
  decimals,
}: {
  address: Address
  chain: number
  price: number
  decimals: number
  symbol: string
}) => {
  const account = useAtomValue(walletAtom)
  const { data } = useBalance({
    address: account ?? undefined,
    chainId: chain,
    token: address,
  })

  const hasBalance = data && data?.value > 0n
  const amount = formatUnits(data?.value ?? 0n, decimals)
  const usdAmount = Number(amount) * price

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        hasBalance ? 'text-primary' : 'text-legend opacity-50'
      )}
    >
      {hasBalance ? <Lock size={20} /> : <LockOpen size={20} />}
      {hasBalance ? (
        <div className="flex flex-col">
          <span className="text-primary">${formatCurrency(usdAmount, 2)}</span>
          <span className="text-sm text-legend">
            {formatCurrency(Number(amount), 2)} {symbol}
          </span>
        </div>
      ) : (
        'No'
      )}
    </div>
  )
}

export default PositionBalance
