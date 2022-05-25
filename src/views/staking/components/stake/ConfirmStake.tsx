import { parseEther } from '@ethersproject/units'
import TransactionModal from 'components/transaction-modal'
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
  const parsedAmount = parseEther(amount ?? '0')
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: `Stake ${amount} RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: 'stRSR',
        address: rToken?.insurance?.token.address ?? ' ',
        method: 'stake',
        args: [parsedAmount],
      },
    }),
    [rToken?.id, amount]
  )
  const requiredAllowance = {
    [RSR.address]: parsedAmount,
  }

  // TODO: Unlimited approval
  const buildApproval = useCallback(() => {
    if (rToken?.insurance) {
      return [
        {
          id: uuid(),
          description: 'Approve RSR for insurance',
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: RSR.address,
            method: 'approve',
            args: [rToken.insurance.token.address, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.id, amount])

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title="Stake RSR"
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      approvalsLabel="Allow use of RSR"
      confirmLabel={`Begin stake of ${formatCurrency(Number(amount))} RSR`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <StakeInput compact disabled={signing} />
    </TransactionModal>
  )
}

export default ConfirmStake
