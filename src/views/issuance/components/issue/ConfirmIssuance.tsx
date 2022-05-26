import { getAddress } from '@ethersproject/address'
import { formatUnits, parseEther } from '@ethersproject/units'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { BigNumberMap, ReserveToken, TransactionState } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import CollateralDistribution from './CollateralDistribution'
import IssueInput from './IssueInput'

/**
 * Build issuance required approval transactions
 */
const buildApprovalTransactions = (
  data: ReserveToken,
  quantities: BigNumberMap,
  allowances: BigNumberMap
): TransactionState[] => {
  const transactions: TransactionState[] = data.basket.collaterals.map(
    ({ token }) => {
      // Specific token approvals
      const tokenAmount = quantities[getAddress(token.address)]
      // Unlimited approval
      // const tokenAmount = BigNumber.from(Number.MAX_SAFE_INTEGER)
      const description = `Approve ${formatUnits(
        tokenAmount,
        token.decimals
      )} ${token.symbol}`

      // TODO: Should I continue using "Skipped" txs?
      return {
        id: uuid(),
        description,
        status: allowances[getAddress(token.address)].gte(tokenAmount)
          ? TRANSACTION_STATUS.SKIPPED
          : TRANSACTION_STATUS.PENDING,
        value: formatUnits(tokenAmount, token.decimals),
        call: {
          abi: 'erc20',
          address: token.address,
          method: 'approve',
          args: [data.isRSV ? data.id : data.token.address, tokenAmount],
        },
      }
    }
  )

  return transactions
}

const ConfirmIssuance = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const loadingQuantities = !Object.keys(quantities).length
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const transaction = useMemo(
    () => ({
      id: '',
      description: `Issue ${amount} ${rToken?.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
        address: rToken?.isRSV ? rToken?.id : rToken?.token.address ?? '',
        method: 'issue',
        args: [isValid ? parseEther(amount) : 0],
      },
    }),
    [rToken?.id, amount]
  )

  const buildApprovals = useCallback(
    (required: BigNumberMap, allowances: BigNumberMap) =>
      rToken ? buildApprovalTransactions(rToken, required, allowances) : [],
    [rToken?.id]
  )

  return (
    <TransactionModal
      title={'Mint ' + rToken?.token.symbol}
      tx={transaction}
      isValid={!loadingQuantities && isValid}
      requiredAllowance={quantities}
      confirmLabel={`Begin minting ${formatCurrency(Number(amount))} ${
        rToken?.token.symbol
      }`}
      approvalsLabel="Allow use of collateral tokens"
      buildApprovals={buildApprovals}
      onClose={onClose}
      onChange={(signing) => setSigning(signing)}
    >
      <IssueInput disabled={signing} compact />
      <CollateralDistribution
        mt={3}
        collaterals={rToken?.basket.collaterals ?? []}
        quantities={quantities}
      />
      {isValid && loadingQuantities && (
        <TextPlaceholder
          sx={{ height: '94px' }}
          mt={3}
          text="Fetching required collateral amounts"
        />
      )}
    </TransactionModal>
  )
}

export default ConfirmIssuance
