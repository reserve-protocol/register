import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionModal from 'components/transaction-modal'
import { BigNumber } from 'ethers'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { RSR, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidStakeAmountAtom, stakeAmountAtom } from 'views/staking/atoms'
import StakeInput from './StakeInput'

const ConfirmStake = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(stakeAmountAtom)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const parsedAmount = isValid ? parseEther(amount) : BigNumber.from(0)
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: t`Stake RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address ?? ' ',
        method: 'stake',
        args: [parsedAmount],
      },
    }),
    [rToken?.address, amount]
  )
  const requiredAllowance = {
    [RSR.address]: parsedAmount,
  }

  const buildApproval = useCallback(() => {
    if (rToken?.stToken) {
      return [
        {
          id: uuid(),
          description: t`Approve RSR`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: RSR.address,
            method: 'approve',
            args: [rToken.stToken.address, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.address, amount])

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title={t`Stake RSR`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      approvalsLabel={t`Allow use of RSR`}
      confirmLabel={t`Begin stake of ${formatCurrency(Number(amount))} RSR`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <StakeInput compact disabled={signing} />
    </TransactionModal>
  )
}

export default ConfirmStake
