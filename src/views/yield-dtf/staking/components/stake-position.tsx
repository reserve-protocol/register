import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { accountCurrentPositionAtom, rateAtom, stRsrTickerAtom } from '../atoms'
import TokenLogo from 'components/icons/TokenLogo'
import { rsrPriceAtom, stRsrBalanceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import TrendingIcon from 'components/icons/TrendingIcon'
import { cn } from '@/lib/utils'

interface StakePositionProps {
  className?: string
}

const StakePosition = ({ className }: StakePositionProps) => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const rate = useAtomValue(rateAtom)
  const balance = useAtomValue(stRsrBalanceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  let rewards = useAtomValue(accountCurrentPositionAtom)

  // Prevent the case when the user withdraws and rewards get stuck awaiting for subgraph
  if (!balance.value && rewards) {
    rewards = 0
  }

  return (
    <div className={cn(className)}>
      <h3 className="ml-6 text-xl font-semibold">
        <Trans>Your stake position</Trans>
      </h3>
      <div className="mt-4 rounded-3xl border border-border p-6">
        <div className="flex items-center">
          <TokenLogo src="/svgs/strsr.svg" />
          <span className="ml-2 font-semibold">
            {formatCurrency(+balance.balance, 2, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
          <span className="ml-1 font-semibold text-muted-foreground">
            {ticker}
          </span>
        </div>
        <hr className="my-3 border-border" />
        <div className="flex items-center gap-2">
          <span className="w-4 text-lg font-semibold">=</span>
          <TokenLogo symbol="rsr" className="mx-2" />
          <div>
            <span className="text-xs text-legend">Exchangeable for</span>
            <div className="font-semibold">
              <span>
                {formatCurrency(+balance.balance * rate, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </span>{' '}
              <span className="text-legend">RSR</span>
            </div>
          </div>
          <span className="ml-auto text-legend">
            ${formatCurrency(+balance.balance * rate * rsrPrice)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <TrendingIcon />
          <TokenLogo symbol="rsr" className="mx-2" />
          <div>
            <span className="text-xs text-legend">Rewards</span>
            <div className="font-semibold">
              <span>
                {formatCurrency(rewards, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </span>{' '}
              <span className="text-legend">RSR</span>
            </div>
          </div>
          <span className="ml-auto text-legend">
            ${formatCurrency(rewards * rsrPrice)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StakePosition
