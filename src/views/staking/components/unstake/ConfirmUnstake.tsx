import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionModal from 'components/transaction-modal'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  isValidUnstakeAmountAtom,
  unStakeAmountAtom,
} from 'views/staking/atoms'
import UnstakeInput from './UnstakeInput'

const ConfirmUnstake = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(unStakeAmountAtom)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)
  const parsedAmount = isValid ? parseEther(amount) : 0
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: t`Unstake ${rToken?.stToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address ?? ' ',
        method: 'unstake',
        args: [parsedAmount],
      },
    }),
    [rToken?.address, amount]
  )

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title={t`Unstake ${rToken?.stToken?.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={{}}
      confirmLabel={t`Begin unstake cooldown`}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <UnstakeInput compact disabled={signing} />
    </TransactionModal>
  )
}

export default ConfirmUnstake
