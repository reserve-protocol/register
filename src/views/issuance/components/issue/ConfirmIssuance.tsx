import { t } from '@lingui/macro'
import RToken from 'abis/RToken'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import TransactionModal from 'components/transaction-modal'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import {
  isValidIssuableAmountAtom,
  issueAmountAtom,
  issueAmountDebouncedAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import CollateralDistribution from './CollateralDistribution'
import IssueInput from './IssueInput'

/**
 * Build issuance required approval transactions
 */
// const buildApprovalTransactions = (
//   data: ReserveToken,
//   quantities: BigNumberMap,
//   allowances: BigNumberMap
// ): TransactionState[] => {
//   const transactions = data.collaterals.reduce((txs, token) => {
//     const tokenAmount = quantities[getAddress(token.address)].add(ONE_ETH)

//     if (!allowances[getAddress(token.address)].gte(tokenAmount)) {
//       return [
//         ...txs,
//         {
//           id: uuid(),
//           description: t`Approve ${token.symbol}`,
//           status: TRANSACTION_STATUS.PENDING,
//           value: formatUnits(tokenAmount, token.decimals),
//           call: {
//             abi: 'erc20',
//             address: token.address,
//             method: 'approve',
//             args: [data.isRSV ? RSV_MANAGER : data.address, tokenAmount],
//           },
//         },
//       ]
//     }

//     return txs
//   }, [] as TransactionState[])

//   return transactions
// }

const callAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const amount = get(issueAmountDebouncedAtom)
  const isValid = get(isValidIssuableAmountAtom)

  if (!isValid || !rToken) {
    return undefined
  }

  return {
    address: rToken.address,
    abi: RToken, // RSV has identical function signature
    functionName: 'issue',
    args: [safeParseEther(amount)],
  }
})

// TODO: New approval flow
const ConfirmIssuance = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const call = useAtomValue(callAtom)

  return (
    <TransactionModal
      title={t`Mint ${rToken?.symbol}`}
      description={`Mint ${rToken?.symbol}`}
      call={call}
      confirmLabel={t`Begin minting ${formatCurrency(Number(amount))} ${
        rToken?.symbol
      }`}
      onClose={onClose}
      onChange={(signing) => setSigning(signing)}
    >
      <IssueInput disabled={signing} compact />
      <CollateralDistribution
        mt={3}
        collaterals={rToken?.collaterals ?? []}
        quantities={quantities}
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
