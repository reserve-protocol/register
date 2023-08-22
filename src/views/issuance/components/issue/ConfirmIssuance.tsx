import { t } from '@lingui/macro'
import RToken from 'abis/RToken'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import TransactionModal from 'components/transaction-modal'
import useHasAllowance, { RequiredAllowance } from 'hooks/useHasAllowance'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { rTokenAtom, walletAtom } from 'state/atoms'
import { BoxProps } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency, safeParseEther } from 'utils'
import { RSV_MANAGER } from 'utils/rsv'
import { Hex } from 'viem'
import {
  isValidIssuableAmountAtom,
  issueAmountAtom,
  issueAmountDebouncedAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
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

// TODO: New approval flow
const ConfirmIssuance = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const [hasAllowance, tokensPendingAllowance] = useHasAllowance(
    useAtomValue(allowancesAtom)
  )
  const call = useAtomValue(callAtom)

  return (
    <TransactionModal
      title={t`Mint ${rToken?.symbol}`}
      description={`Mint ${rToken?.symbol}`}
      call={call}
      confirmLabel={
        hasAllowance
          ? t`Begin minting ${formatCurrency(Number(amount))} ${rToken?.symbol}`
          : 'Please grant collateral allowance'
      }
      onClose={onClose}
      onChange={(signing) => setSigning(signing)}
      disabled={!hasAllowance}
    >
      <IssueInput disabled={signing} compact />
      <CollateralApprovals
        hasAllowance={hasAllowance}
        pending={tokensPendingAllowance}
      />
      <TextPlaceholder
        sx={{
          height: '94px',
          display: amount && !quantities ? 'flex' : 'none',
        }}
        mt={3}
        text={t`Fetching required collateral amounts`}
      />
    </TransactionModal>
  )
}

export default ConfirmIssuance
