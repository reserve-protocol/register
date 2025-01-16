import { t } from '@lingui/macro'
import BasketHandler from 'abis/BasketHandler'
import RToken from 'abis/RToken'
import TransactionModal from 'components/transaction-modal'
import useHasAllowance, { RequiredAllowance } from 'hooks/useHasAllowance'
import { atom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useState } from 'react'
import {
  chainIdAtom,
  rTokenAtom,
  rTokenContractsAtom,
  walletAtom,
} from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import { Hex } from 'viem'
import {
  isValidIssuableAmountAtom,
  issueAmountAtom,
  issueAmountDebouncedAtom,
  quantitiesAtom,
} from '@/views/yield-dtf/issuance/atoms'
import CollateralApprovals from './CollateralApprovals'
import IssueInput from './IssueInput'
import { useReadContract } from 'wagmi'

const callAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const amount = get(issueAmountDebouncedAtom)
  const isValid = get(isValidIssuableAmountAtom)

  if (!isValid || !rToken) {
    return undefined
  }

  return {
    address: rToken.address,
    abi: RToken,
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
    spender: rToken.address,
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
  const chain = useAtomValue(chainIdAtom)
  const call = useAtomValue(callAtom)

  const { data: isReady } = useReadContract({
    abi: BasketHandler,
    address: rTokenContracts?.basketHandler?.address,
    functionName: 'isReady',
    chainId: chain,
  })

  const handleChange = (signing: boolean) => {
    setSigning(signing)
    if (signing) {
      mixpanel.track('Confirmed Mint', {
        RToken: rToken?.address.toLowerCase() ?? '',
      })
    }
  }

  const getConfirmText = () => {
    if (!isReady) {
      return t`Basket is not ready`
    }

    if (!hasAllowance) {
      return 'Please grant collateral allowance'
    }

    return t`Begin minting ${formatCurrency(Number(amount))} ${rToken?.symbol}`
  }

  return (
    <TransactionModal
      title={t`Mint ${rToken?.symbol}`}
      description={`Mint ${rToken?.symbol}`}
      call={call}
      confirmLabel={getConfirmText()}
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
