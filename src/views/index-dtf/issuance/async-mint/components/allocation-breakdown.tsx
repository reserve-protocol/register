import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue } from 'jotai'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { formatUnits } from 'viem'
import { collateralAllocationAtom } from '../atoms'

const AllocationBreakdown = () => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const allocation = useAtomValue(collateralAllocationAtom)
  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <>
      <button
        className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <span>Allowed use breakdown</span>
        {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showBreakdown && (
        <div className="flex flex-col gap-1 bg-background rounded-2xl p-3">
          {Object.entries(allocation).map(([address, alloc]) => {
            const token = basket?.find(
              (t) => t.address.toLowerCase() === address.toLowerCase()
            )
            const decimals = token?.decimals ?? 18
            const totalAmount = alloc.fromWallet + alloc.fromSwap

            let badge = ''
            if (alloc.explanation === 'Token at its maximum weight')
              badge = 'At weight'
            else if (alloc.explanation === 'Using your full balance')
              badge = 'Max bal'

            return (
              <div
                key={address}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <TokenLogo
                    address={address}
                    symbol={token?.symbol || ''}
                    chain={chainId}
                    size="sm"
                  />
                  <span className="text-sm">
                    {formatTokenAmount(
                      Number(formatUnits(totalAmount, decimals))
                    )}{' '}
                    {token?.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / ${formatCurrency(alloc.usdValue)}
                  </span>
                </div>
                {badge && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default AllocationBreakdown
