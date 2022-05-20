import { parseEther } from '@ethersproject/units'
import { ERC20Interface, StRSRInterface } from 'abis'
import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidStakeAmountAtom, stakeAmountAtom } from 'views/staking/atoms'
import StakeInput from './StakeInput'

const ConfirmStake = ({ onClose }: { onClose: () => void }) => {
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(stakeAmountAtom)
  const parsedAmount = parseEther(amount ?? '0')
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: `Stake ${amount} RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: StRSRInterface,
        address: rToken?.insurance?.token.address ?? ' ',
        method: 'stake',
        args: [parsedAmount],
      },
    }),
    [rToken?.id, amount]
  )
  const requiredAllowance = {
    [rToken?.insurance?.token.address ?? ' ']: parsedAmount,
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
            abi: ERC20Interface,
            address: rToken.token.address,
            method: 'approve',
            args: [rToken.insurance.token.address, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.id, amount])

  return (
    <TransactionModal
      title="Stake RSR"
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      approvalsLabel="Allow use of RSR"
      confirmLabel={`Begin stake of ${formatCurrency(Number(amount))} RSR`}
      buildApprovals={buildApproval}
      onClose={onClose}
    >
      <StakeInput compact />
    </TransactionModal>
  )
}

export default ConfirmStake
