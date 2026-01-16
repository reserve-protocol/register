import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { stRsrBalanceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'
import { stakeAmountUsdAtom, stakeOutputAtom } from './atoms'

const StRsrBalance = () => {
  const balance = useAtomValue(stRsrBalanceAtom)

  return (
    <div className="ml-auto flex items-center flex-shrink-0">
      <TokenLogo width={16} src="/svgs/strsr.svg" />
      <span className="ml-2 text-legend">Balance</span>
      <span className="mx-1 font-semibold">
        {formatCurrency(+balance.balance, 2, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </span>
    </div>
  )
}

const StakeOutput = () => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const stAmount = useAtomValue(stakeOutputAtom)
  const usdAmount = useAtomValue(stakeAmountUsdAtom)

  return (
    <div className="p-3 border border-border rounded-3xl overflow-hidden">
      <span className="block">You receive:</span>
      <div className="flex items-center text-xl font-semibold overflow-hidden">
        <span>{formatCurrency(stAmount)}</span>
        <span className="ml-2 text-legend">{ticker}</span>
      </div>
      <div className="flex items-center">
        <span className="text-legend overflow-hidden text-ellipsis">
          ${formatCurrency(usdAmount, 2)}
        </span>
        <StRsrBalance />
      </div>
    </div>
  )
}

export default StakeOutput
