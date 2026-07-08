import { cn } from '@/lib/utils'
import { blockAtom, chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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

  if (!account.address || dtfAmount === undefined || dtfAmount <= 0) {
    return null
  }

  return (
    <Link
      to={ROUTES.PORTFOLIO}
      className="group mb-2 flex flex-col gap-1.5 rounded-xl p-4 font-normal transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="text-sm text-muted-foreground">
        <Trans>{dtf?.token.symbol ?? 'DTF'} balance</Trans>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <div className="font-semibold text-2xl">
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
        <div className="flex shrink-0 items-center gap-2 text-base font-medium text-muted-foreground transition-colors group-hover:text-primary">
          <Trans>View portfolio</Trans>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-0.5">
          {!!variationValue && variationValue < 0 ? (
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
          ) : (
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
          )}
          <div className="text-primary pr-0.5">
            ${formatCurrency(Math.abs(variationValue ?? 0), 2)}
          </div>{' '}
          <Trans>Past week</Trans>
        </div>
        <span aria-hidden="true" className="text-muted-foreground">
          ·
        </span>
        <div className="text-muted-foreground">
          {formatCurrency(dtfAmount ?? 0, 2)} {dtf?.token.symbol}
        </div>
      </div>
    </Link>
  )
}

export default DTFBalance
