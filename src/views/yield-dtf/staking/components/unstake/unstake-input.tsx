import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/react/macro'
import { NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rsrPriceAtom, stRsrBalanceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { rateAtom, stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'
import InputPostfix from '../input-postfix'
import { unStakeAmountAtom } from './atoms'

const UnstakeInputField = () => {
  const [amount, setAmount] = useAtom(unStakeAmountAtom)
  const ticker = useAtomValue(stRsrTickerAtom)

  useEffect(() => {
    return () => {
      setAmount('')
    }
  }, [])

  return (
    <div className="relative z-0">
      <NumericalInput
        data-testid="unstake-amount-input"
        variant="transparent"
        placeholder={`0 ${ticker}`}
        value={amount}
        onChange={setAmount}
      />
      {!!amount && <InputPostfix amount={amount} symbol={ticker} />}
    </div>
  )
}

const UnstakeUsdAmount = () => {
  const price = useAtomValue(rsrPriceAtom)
  const amount = useAtomValue(unStakeAmountAtom)
  const rate = useAtomValue(rateAtom)

  if (!amount) {
    return null
  }

  return (
    <span className="mr-3 overflow-hidden text-ellipsis text-legend">
      ${formatCurrency(price * (Number(amount) * rate), 2)}
    </span>
  )
}

const UnstakeBalance = () => {
  const balance = useAtomValue(stRsrBalanceAtom)
  const setAmount = useSetAtom(unStakeAmountAtom)

  return (
    <div className="ml-auto flex items-center flex-shrink-0">
      <TokenLogo width={16} src="/svgs/strsr.svg" />
      <span className="ml-2 text-legend">
        <Trans>Balance</Trans>
      </span>
      <span className="mx-1 font-semibold">
        {formatCurrency(+balance.balance, 2, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </span>
      <Button size="sm" variant="muted" onClick={() => setAmount(balance.balance)}>
        <Trans>Max</Trans>
      </Button>
    </div>
  )
}

const UnstakeInput = () => (
  <div className="overflow-hidden bg-muted rounded-3xl p-3">
    <span>
      <Trans>You unstake:</Trans>
    </span>
    <UnstakeInputField />
    <div className="flex items-center">
      <UnstakeUsdAmount />
      <UnstakeBalance />
    </div>
  </div>
)

export default UnstakeInput
