import { t } from '@lingui/macro'
import RToken from 'abis/RToken'
import RSVManager from 'abis/RSVManager'
import TransactionModal from 'components/transaction-modal'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import {
  isModuleLegacyAtom,
  rTokenAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import { RSV_MANAGER } from 'utils/rsv'
import {
  isValidRedeemAmountAtom,
  redeemAmountAtom,
  redeemAmountDebouncedAtom,
} from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'
import RedeemNonceModal from './RedeemNonceModal'
import RedemptionQuote from './RedemptionQuote'
import { customRedeemModalAtom } from './atoms'

const callAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const amount = get(redeemAmountDebouncedAtom)
  const isValid = get(isValidRedeemAmountAtom)
  const { isCollaterized, basketNonce: nonce } = get(rTokenStateAtom)
  const { issuance: isLegacy } = get(isModuleLegacyAtom)
  const account = get(walletAtom)

  if (!rToken || !isValid || !account) {
    return undefined
  }

  const parsedAmount = safeParseEther(amount)

  // Normal case, redeem directly
  if (isCollaterized || isLegacy) {
    return {
      abi: isLegacy ? RSVManager : RToken,
      address: rToken.main ? rToken.address : RSV_MANAGER,
      functionName: 'redeem',
      args: rToken?.main && isLegacy ? [parsedAmount, nonce] : [parsedAmount],
    }
  }

  // Undercollaterized, customRedemption
  return {
    abi: RToken,
    address: rToken.address,
    method: 'redeemCustom',
    args: [account, parsedAmount, [BigInt(nonce)], [1n, [], []]],
  }
})

const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const nonceModal = useAtomValue(customRedeemModalAtom)

  const call = useAtomValue(callAtom)

  const requiredAllowance = useMemo(() => {
    // Allowance is only required for RSV redemption
    if (!call || !rToken || rToken?.main) {
      return undefined
    }

    return {
      token: rToken.address,
      spender: call.address,
      amount: call.args[0] as bigint,
      symbol: 'RSV',
      decimals: 18,
    }
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
      description={t`Redeem ${rToken?.symbol}`}
      call={call}
      requiredAllowance={requiredAllowance}
      confirmLabel={t`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.symbol ?? ''
      }`}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <RedeemInput compact disabled={signing} />
      <RedemptionQuote />
    </TransactionModal>
  )
}

export default ConfirmRedemption
