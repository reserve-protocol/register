import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import TransactionModal from 'components/transaction-modal'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'

// TODO: Display redeemable collateral
const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const parsedAmount = isValid ? parseEther(amount) : BigNumber.from(0)
  const transaction = useMemo(
    () => ({
      id: '',
      description: `Redeem ${amount} ${rToken?.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
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
            abi: 'erc20',
            address: rToken.token.address,
            method: 'approve',
            args: [rToken.id, parsedAmount],
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
      title={`Redeem ${rToken?.token.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      confirmLabel={`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.token.symbol ?? ''
      }`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <RedeemInput compact disabled={signing} />
    </TransactionModal>
  )
}

export default ConfirmRedemption
