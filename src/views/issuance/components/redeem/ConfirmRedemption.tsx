import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionModal from 'components/transaction-modal'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'

// TODO: Display redeemable collateral?
const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const parsedAmount = isValid ? parseEther(amount) : BigNumber.from(0)
  const transaction = useMemo(
    () => ({
      id: '',
      description: t`Redeem ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
        address: rToken?.isRSV ? RSV_MANAGER : rToken?.address ?? '',
        method: 'redeem',
        args: [parsedAmount],
      },
    }),
    [rToken?.address, amount]
  )

  const requiredAllowance = rToken?.isRSV
    ? {
        [rToken.address]: parsedAmount,
      }
    : {}

  // TODO: Unlimited approval
  const buildApproval = useCallback(() => {
    if (rToken && rToken.isRSV) {
      return [
        {
          id: uuid(),
          description: t`Approve RSV`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: rToken.address,
            method: 'approve',
            args: [RSV_MANAGER, parsedAmount],
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
      title={t`Redeem ${rToken?.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      confirmLabel={t`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.symbol ?? ''
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
