import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import TransactionModal from 'components/transaction-modal'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import {
  getValidWeb3Atom,
  isModuleLegacyAtom,
  rTokenAtom,
  rTokenCollaterizedAtom,
} from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import {
  isValidRedeemAmountAtom,
  redeemAmountAtom,
  redeemAmountDebouncedAtom,
} from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'
import RedemptionQuote from './RedemptionQuote'
import { customRedeemModalAtom, redeemNonceAtom } from './atoms'
import RedeemNonceModal from './RedeemNonceModal'

const redeemTxAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const amount = get(redeemAmountDebouncedAtom)
  const isValid = get(isValidRedeemAmountAtom)
  const nonce = get(redeemNonceAtom)
  const isCollaterized = get(rTokenCollaterizedAtom)
  const { issuance: isLegacy } = get(isModuleLegacyAtom)
  const { account } = get(getValidWeb3Atom)

  const parsedAmount = isValid ? safeParseEther(amount) : BigNumber.from(0)

  const txBody = {
    id: '',
    description: t`Redeem ${rToken?.symbol}`,
    status: TRANSACTION_STATUS.PENDING,
    value: amount,
  }

  // Normal case, redeem directly
  if (isCollaterized || isLegacy) {
    return {
      ...txBody,
      call: {
        abi: rToken?.main ? `${isLegacy ? '_' : ''}rToken` : 'rsv',
        address: rToken?.main ? rToken?.address ?? '' : RSV_MANAGER,
        method: 'redeem',
        args: rToken?.main && isLegacy ? [parsedAmount, nonce] : [parsedAmount],
      },
    }
  }

  // Undercollaterized, customRedemption
  return {
    ...txBody,
    call: {
      abi: 'rToken',
      address: rToken?.address ?? '',
      method: 'redeemCustom',
      args: [
        account,
        parsedAmount,
        [BigNumber.from(nonce)],
        [BigNumber.from(1), [], []],
      ],
    },
  }
})

const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const parsedAmount = isValid ? safeParseEther(amount) : BigNumber.from(0)
  const nonceModal = useAtomValue(customRedeemModalAtom)

  const transaction = useAtomValue(redeemTxAtom)

  const requiredAllowance = useMemo(
    () =>
      rToken && !rToken.main
        ? {
            [rToken.address]: parsedAmount,
          }
        : {},
    [rToken?.address, amount]
  )

  const buildApproval = useCallback(() => {
    // TODO: Only for RSV, remove when deprecated
    if (rToken && !rToken.main) {
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

  const handleClose = useCallback(() => {
    onClose()
    setAmount('')
  }, [])

  if (nonceModal) {
    return <RedeemNonceModal onClose={handleClose} />
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
      <RedemptionQuote />
    </TransactionModal>
  )
}

export default ConfirmRedemption
