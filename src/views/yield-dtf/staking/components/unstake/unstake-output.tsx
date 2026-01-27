import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { rsrBalanceAtom, rsrPriceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { rateAtom } from '@/views/yield-dtf/staking/atoms'
import { unStakeAmountAtom } from './atoms'

const RsrBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)

  return (
    <div className="ml-auto flex items-center flex-shrink-0">
      <TokenLogo width={16} symbol="rsr" />
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

const UnstakeOutput = () => {
  const amount = useAtomValue(unStakeAmountAtom)
  const rate = useAtomValue(rateAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <div className="p-3 border border-border rounded-3xl overflow-hidden">
      <span className="block">You receive:</span>
      <div className="flex items-center text-xl font-semibold overflow-hidden">
        <span>{amount ? formatCurrency(Number(amount) * rate) : '0'}</span>
        <span className="ml-2 text-legend">RSR</span>
      </div>
      <div className="flex items-center">
        <span className="text-legend overflow-hidden text-ellipsis">
          ${formatCurrency(price * (Number(amount) * rate), 2)}
        </span>
        <RsrBalance />
      </div>
    </div>
  )
}

export default UnstakeOutput
