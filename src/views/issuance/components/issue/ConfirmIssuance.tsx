import { t } from '@lingui/macro'
import BasketHandler from 'abis/BasketHandler'
import RToken from 'abis/RToken'
import TransactionModal from 'components/transaction-modal'
import useHasAllowance, { RequiredAllowance } from 'hooks/useHasAllowance'
import { atom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useMemo, useState } from 'react'
import { rTokenAtom, rTokenContractsAtom, walletAtom } from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import { RSV_MANAGER } from 'utils/rsv'
import { Hex } from 'viem'
import {
  isValidIssuableAmountAtom,
  issueAmountAtom,
  issueAmountDebouncedAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import { useContractRead } from 'wagmi'
import CollateralApprovals from './CollateralApprovals'
import IssueInput from './IssueInput'

const callAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const amount = get(issueAmountDebouncedAtom)
  const isValid = get(isValidIssuableAmountAtom)

  if (!isValid || !rToken) {
    return undefined
  }

  return {
    address: rToken.main ? rToken.address : RSV_MANAGER,
    abi: RToken, // RSV has identical function signature
    functionName: 'issue',
    args: [safeParseEther(amount)],
  }
})

const allowancesAtom = atom((get) => {
  const quantities = get(quantitiesAtom)
  const rToken = get(rTokenAtom)
  const wallet = get(walletAtom)

  if (!quantities || !wallet || !rToken) {
    return undefined
  }

  return Object.keys(quantities).map((address) => ({
    token: address,
    spender: !rToken.main ? RSV_MANAGER : rToken.address,
    amount: quantities[address as Hex],
  })) as RequiredAllowance[]
})

const ConfirmIssuance = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const rTokenContracts = useAtomValue(rTokenContractsAtom)
  const amount = useAtomValue(issueAmountAtom)
  const [hasAllowance, tokensPendingAllowance] = useHasAllowance(
    useAtomValue(allowancesAtom)
  )

  const { data: isReady } = useContractRead({
    abi: BasketHandler,
    address: rTokenContracts?.basketHandler?.address,
    functionName: 'isReady',
  })
  const call = useAtomValue(callAtom)

  const handleChange = (signing: boolean) => {
    setSigning(signing)
    if (signing) {
      mixpanel.track('Confirmed Mint', {
        RToken: rToken?.address.toLowerCase() ?? '',
      })
    }
  }

  const confirmText = useMemo(() => {
    if (!isReady) {
      return t`Basket is not ready`
    }

    if (!hasAllowance) {
      return 'Please grant collateral allowance'
    }

    return t`Begin minting ${formatCurrency(Number(amount))} ${rToken?.symbol}`
  }, [amount, hasAllowance, isReady, rToken?.symbol])

  return (
    <TransactionModal
      title={t`Mint ${rToken?.symbol}`}
      description={`Mint ${rToken?.symbol}`}
      call={call}
      confirmLabel={confirmText}
      onClose={onClose}
      onChange={handleChange}
      disabled={!hasAllowance}
    >
      <IssueInput disabled={signing} compact />
      <CollateralApprovals
        hasAllowance={hasAllowance}
        pending={tokensPendingAllowance}
      />
    </TransactionModal>
  )
}

export default ConfirmIssuance
