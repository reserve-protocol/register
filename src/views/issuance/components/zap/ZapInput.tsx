import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { isRTokenDisabledAtom } from 'state/atoms'
import { maxZappableAmountAtom, zapInputAmountAtom } from '../../atoms'

const ZapInput = (props: Partial<TransactionInputProps>) => {
  const zappableAmount = useAtomValue(maxZappableAmountAtom)
  const isTokenDisabled = useAtomValue(isRTokenDisabledAtom)

  return (
    <TransactionInput
      placeholder={t`Zap amount`}
      amountAtom={zapInputAmountAtom}
      maxAmount={zappableAmount}
      disabled={isTokenDisabled}
      {...props}
    />
  )
}

export default ZapInput
