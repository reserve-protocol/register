import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { ERC20Interface } from 'abis'
import { Button, NumericalInput } from 'components'
import Modal from 'components/modal'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { addTransactionAtom, allowanceAtom } from 'state/atoms'
import { ReserveToken, TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'
import { issueAmountAtom, quantitiesAtom } from 'views/issuance/atoms'
import IssuanceApprovals from './modal/Approvals'

interface Props {
  data: ReserveToken
  issuableAmount: number
  onClose: () => void
}

interface IQuantities {
  [x: string]: BigNumber
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
  quantities: IQuantities,
  allowances: IQuantities
): TransactionState[] => {
  const tokenQuantities: [string, BigNumber][] = []

  // Create token approvals calls array
  const transactions: TransactionState[] = data.basket.collaterals.map(
    ({ token }) => {
      const tokenAmount = quantities[getAddress(token.address)]
      console.log('token amount', quantities)
      const description = `Approve ${formatUnits(
        tokenAmount,
        token.decimals
      )} ${token.symbol}`

      // Fill token quantities on the same map
      tokenQuantities.push([token.address, tokenAmount])

      return {
        description,
        status: allowances[getAddress(token.address)].gte(tokenAmount)
          ? TRANSACTION_STATUS.SKIPPED
          : TRANSACTION_STATUS.PENDING,
        value: formatUnits(tokenAmount, token.decimals),
        call: {
          abi: ERC20Interface,
          address: token.address,
          method: 'approve',
          args: [data.isRSV ? data.id : data.token.address, tokenAmount],
        },
      }
    }
  )

  return transactions
}

// // Create token issuance contract call
// transactions.push({
//   description: `Issue ${amount} ${data.token.symbol}`,
//   status: TRANSACTION_STATUS.PENDING,
//   value: amount,
//   requiredAllowance: tokenQuantities, // Send quantities as an extra prop for allowance check before issuance
//   call: {
//     abi: data.isRSV ? RSVManagerInterface : RTokenInterface,
//     address: data.isRSV ? data.id : data.token.address,
//     method: 'issue',
//     args: [parseEther(amount)],
//   },
// })

const ConfirmModal = ({ data, issuableAmount, onClose }: Props) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const [approvalsTx, setApprovalsTx] = useState([] as TransactionState[])
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const blockNumber = useBlockNumber()

  const isValid = () => {
    const _value = Number(amount)
    return _value > 0 && _value <= issuableAmount
  }

  const handleIssue = () => {
    // addTransaction(txs)
    onClose()
  }

  useEffect(() => {
    if (Object.keys(allowances).length && Object.keys(quantities).length) {
      setApprovalsTx(buildApprovalTransactions(data, quantities, allowances))
    } else {
      setApprovalsTx([])
    }
  }, [JSON.stringify(allowances), JSON.stringify(quantities)])

  return (
    <Modal title="Confirm Issuance" onClose={onClose}>
      <NumericalInput
        id="mint"
        placeholder="Mint amount"
        value={amount}
        onChange={setAmount}
      />
      <IssuanceApprovals txs={approvalsTx} />
      <Button
        sx={{ width: '100%' }}
        disabled={!isValid()}
        mt={2}
        onClick={handleIssue}
      >
        + Mint {data.token.symbol}
      </Button>
    </Modal>
  )
}

export default ConfirmModal
