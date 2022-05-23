import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { BigNumberMap, ReserveToken, TransactionState } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import IssueInput from './IssueInput'
import CollateralDistribution from './CollateralDistribution'

interface Props {
  data: ReserveToken
  onClose: () => void
}

/**
 * Build issuance required transactions
 *
 * @param data <ReserveToken>
 * @param amount <string>
 * @param quantities <BigNumber[]>
 * @returns TransactionState[]
 */
const buildApprovalTransactions = (
  data: ReserveToken,
  quantities: BigNumberMap,
  allowances: BigNumberMap
): TransactionState[] => {
  const tokenQuantities: [string, BigNumber][] = []

  // Create token approvals calls array
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

      // Fill token quantities on the same map
      tokenQuantities.push([token.address, tokenAmount])

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

const ConfirmModal = ({ data, onClose }: Props) => {
  const amount = useAtomValue(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const isValid = useAtomValue(isValidIssuableAmountAtom)
  const [signing, setSigning] = useState(false)
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: `Issue ${amount} ${data.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: data.isRSV ? 'rsv' : 'rToken',
        address: data.isRSV ? data.id : data.token.address,
        method: 'issue',
        args: [parseEther(amount ?? '0')],
      },
    }),
    [data.id, amount]
  )

  const confirmLabel = `Begin minting ${formatCurrency(Number(amount))} ${
    data.token.symbol
  }`

  const buildApprovals = useCallback(
    (required: BigNumberMap, allowances: BigNumberMap) =>
      buildApprovalTransactions(data, required, allowances),
    [data?.id]
  )

  return (
    <TransactionModal
      title={'Mint ' + data.token.symbol}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={quantities}
      confirmLabel={confirmLabel}
      approvalsLabel="Allow use of collateral tokens"
      buildApprovals={buildApprovals}
      onClose={onClose}
      onConfirm={() => setSigning(true)}
    >
      <IssueInput disabled={signing} compact />
      <CollateralDistribution mt={3} data={data} quantities={quantities} />
    </TransactionModal>
  )
}

export default ConfirmModal
