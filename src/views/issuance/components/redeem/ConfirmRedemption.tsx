import { parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'

// TODO: Display redeemable collateral
const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(redeemAmountAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const parsedAmount = parseEther(amount ?? '0')
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: `Redeem ${amount} ${rToken?.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? RSVManagerInterface : RTokenInterface,
        address: rToken?.isRSV ? rToken?.id : rToken?.token.address ?? '',
        method: 'redeem',
        args: [parsedAmount],
      },
    }),
    [rToken?.id, amount]
  )

  const requiredAllowance = rToken?.isRSV
    ? {
        [rToken.token.address]: parsedAmount,
      }
    : {}

  // TODO: Unlimited approval
  const buildApproval = useCallback(() => {
    if (rToken && rToken.isRSV) {
      return [
        {
          id: uuid(),
          description: 'Approve RSV for redemption',
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: ERC20Interface,
            address: rToken.token.address,
            method: 'approve',
            args: [rToken.id, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.id, amount])

  return (
    <TransactionModal
      title={`Redeem ${rToken?.token.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      confirmLabel={`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.token.symbol ?? ''
      }`}
      buildApprovals={buildApproval}
      onClose={onClose}
    >
      <RedeemInput compact />
    </TransactionModal>
  )
}

export default ConfirmRedemption
