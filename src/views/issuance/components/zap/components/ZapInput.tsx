import { t } from '@lingui/macro'
import TransactionInput from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { isRTokenDisabledAtom } from 'state/atoms'
import { selectedZapTokenAtom, zapInputString } from '../state/atoms'
import { ui } from '../state/ui-atoms'

const ZapInput = () => {
  const token = useAtomValue(selectedZapTokenAtom)
  const isDisabled = useAtomValue(isRTokenDisabledAtom)
  const maxAmountString = useAtomValue(ui.input.maxAmount)

  return (
    <TransactionInput
      placeholder={`${token?.symbol} ${t`Amount`}`}
      amountAtom={zapInputString}
      title={t`Zap mint`}
      maxAmount={maxAmountString || '0'}
      disabled={isDisabled}
    />
  )
}

export default ZapInput
