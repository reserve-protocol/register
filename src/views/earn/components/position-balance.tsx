import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/lib/utils'
import { walletAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Lock, LockOpen } from 'lucide-react'
import { useEffect } from 'react'
import { Address, formatUnits } from 'viem'
import { useBalance, useBlockNumber } from 'wagmi'

const PositionBalance = ({
  address,
  chain,
  symbol,
  price,
  decimals,
  conversionRate = 1,
}: {
  address: Address
  chain: number
  price: number
  decimals: number
  symbol: string
  // Assets-per-share rate for appreciating vaults: converts the raw share
  // balance into the symbol's denomination. Defaults to 1 (legacy 1:1 vaults).
  conversionRate?: number
}) => {
  const account = useAtomValue(walletAtom)

  // Watch for new blocks to update balance
  const { data: blockNumber } = useBlockNumber({
    chainId: chain,
    watch: true,
  })

  const { data, refetch } = useBalance({
    address: account ?? undefined,
    chainId: chain,
    token: address,
  })

  // Refetch balance when block changes
  useEffect(() => {
    if (blockNumber && account) {
      refetch()
    }
  }, [blockNumber, refetch, account])

  const hasBalance = data && data?.value > 0n
  const amount =
    Number(formatUnits(data?.value ?? 0n, decimals)) * conversionRate
  const usdAmount = amount * price

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
          <span className="text-primary">
            $
            <AnimatedNumber
              value={usdAmount}
              formatter={(value) => formatCurrency(value, 2)}
            />
          </span>
          <span className="text-sm text-legend">
            <AnimatedNumber
              value={amount}
              formatter={(value) => formatCurrency(value, 2)}
            />{' '}
            {symbol}
          </span>
        </div>
      ) : (
        <Trans>None</Trans>
      )}
    </div>
  )
}

export default PositionBalance
