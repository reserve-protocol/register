import { cn } from '@/lib/utils'
import { blockAtom, chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { formatEther } from 'viem'
import { useAccount, useBalance } from 'wagmi'

const DTFBalance = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const account = useAccount()
  const dtf7dChange = useAtomValue(indexDTF7dChangeAtom)
  // Reuse the globally-polled block for the current chain (AtomUpdater) instead
  // of opening a second eth_blockNumber poll just for this balance.
  const block = useAtomValue(blockAtom)

  const { data: userBalanceData, refetch: refetchBalance } = useBalance({
    address: account.address,
    chainId: chainId,
    token: dtf?.id,
    query: {
      enabled: !!dtf?.id && !!account.address,
    },
  })

  const dtfAmount = useMemo(() => {
    if (userBalanceData === undefined) return undefined
    return Number(formatEther(userBalanceData.value))
  }, [userBalanceData, indexDTFPrice])

  const balanceValue = useMemo(() => {
    if (dtfAmount === undefined || indexDTFPrice === undefined) return undefined
    return dtfAmount * indexDTFPrice
  }, [dtfAmount, indexDTFPrice])

  const variationValue = useMemo(() => {
    if (!dtf7dChange || !balanceValue) return undefined
    return balanceValue * dtf7dChange
  }, [dtf7dChange, balanceValue])

  useEffect(() => {
    if (block && account.address) {
      refetchBalance()
    }
  }, [block])

  return (
    <div className="flex flex-col gap-2 font-normal -mt-4">
      <div>
        <Trans>Balance</Trans>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <div className="font-semibold text-3xl">
          {balanceValue !== undefined ? (
            <div
              className={cn(
                balanceValue > 0 ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              ${formatCurrency(balanceValue, 2)}
            </div>
          ) : (
            <div className="text-muted-foreground">$—.—</div>
          )}
        </div>
        <div className="text-muted-foreground">
          {formatCurrency(dtfAmount ?? 0, 2)} {dtf?.token.symbol}
        </div>
      </div>
      <div className="flex items-center gap-0.5 text-muted-foreground">
        {!!variationValue && variationValue < 0 ? (
          <ArrowDown className="w-4 h-4 text-primary" />
        ) : (
          <ArrowUp className="w-4 h-4 text-primary" />
        )}
        <div className="text-primary pr-0.5">
          ${formatCurrency(Math.abs(variationValue ?? 0), 2)}
        </div>{' '}
        <Trans>Past week</Trans>
      </div>
    </div>
  )
}

export default DTFBalance
