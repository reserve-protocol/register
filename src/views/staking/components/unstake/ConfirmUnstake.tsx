import { parseEther } from '@ethersproject/units'
import { StRSRInterface } from 'abis'
import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenAtom } from 'state/atoms'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidStakeAmountAtom, unStakeAmountAtom } from 'views/staking/atoms'
import UnstakeInput from './UnstakeInput'

const ConfirmUnstake = ({ onClose }: { onClose: () => void }) => {
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(unStakeAmountAtom)
  const parsedAmount = parseEther(amount ?? '0')
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: `Unstake ${amount} ${rToken?.insurance?.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: StRSRInterface,
        address: rToken?.insurance?.token.address ?? ' ',
        method: 'unstake',
        args: [parsedAmount],
      },
    }),
    [rToken?.id, amount]
  )

  return (
    <TransactionModal
      title={`Unstake ${rToken?.insurance?.token.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={{}}
      confirmLabel={`Begin unStake cooldown`}
      onClose={onClose}
    >
      <UnstakeInput compact />
    </TransactionModal>
  )
}

export default ConfirmUnstake
