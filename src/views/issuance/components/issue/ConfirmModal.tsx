import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import { Button, NumericalInput } from 'components'
import Modal from 'components/modal'
import { useRTokenContract } from 'hooks/useContract'
import useLastTx from 'hooks/useLastTx'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { addTransactionAtom, allowanceAtom } from 'state/atoms'
import { Divider, Text } from 'theme-ui'
import { BigNumberMap, ReserveToken, TransactionState } from 'types'
import { formatCurrency, hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import {
  issueAmountAtom,
  maxIssuableAtom,
  quantitiesAtom,
} from 'views/issuance/atoms'
import IssuanceApprovals from './modal/Approvals'
import CollateralDistribution from './modal/CollateralDistribution'
import IssuanceConfirmation from './modal/IssuanceConfirmation'
import { v4 as uuid } from 'uuid'

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

const ConfirmModal = ({ data, onClose }: Props) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const issuableAmount = useAtomValue(maxIssuableAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const contract = useRTokenContract(data.token.address, true)!
  const [signing, setSigning] = useState(false)
  const [mining, setMining] = useState(false)
  const [approvalsTx, setApprovalsTx] = useState([] as TransactionState[])
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const [issueTx] = useLastTx(signing ? 1 : 0)
  const approvalsNeeded = useMemo(
    () => approvalsTx.some((tx) => tx.status === TRANSACTION_STATUS.PENDING),
    [approvalsTx]
  )
  const canIssue = useMemo(
    () => hasAllowance(allowances, quantities),
    [allowances, quantities]
  )

  const isValid = () => {
    const _value = Number(amount)
    return _value > 0 && _value <= issuableAmount && canIssue
  }

  const handleIssue = async () => {
    if (signing) return

    setSigning(true)
    try {
      const issueAmount = parseEther(amount)

      if (!data.isRSV) {
        await contract.callStatic.issue(issueAmount)
      }

      addTransaction([
        {
          id: uuid(),
          description: `Issue ${amount} ${data.token.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: data.isRSV ? RSVManagerInterface : RTokenInterface,
            address: data.isRSV ? data.id : data.token.address,
            method: 'issue',
            args: [issueAmount],
          },
        },
      ])
    } catch (e) {
      setSigning(false)
      // TODO: Handle error case
      console.log('error issuing')
    }
  }

  useEffect(() => {
    if (Object.keys(allowances).length && Object.keys(quantities).length) {
      setApprovalsTx(buildApprovalTransactions(data, quantities, allowances))
    } else {
      setApprovalsTx([])
    }
  }, [allowances, quantities])

  const signed =
    signing &&
    issueTx?.call.method === 'issue' &&
    issueTx.status !== TRANSACTION_STATUS.PENDING &&
    issueTx.status !== TRANSACTION_STATUS.SIGNING

  return (
    <Modal
      title={signed ? 'Confirm Issuance' : ''}
      onClose={onClose}
      style={{ width: '400px' }}
    >
      {signed ? (
        <IssuanceConfirmation onClose={onClose} />
      ) : (
        <>
          <NumericalInput
            id="mint"
            placeholder="Mint amount"
            value={amount}
            onChange={setAmount}
          />
          <CollateralDistribution mt={3} data={data} quantities={quantities} />
          {approvalsNeeded && !canIssue && (
            <IssuanceApprovals symbol={data.token.symbol} txs={approvalsTx} />
          )}
          <Divider mx={-3} mt={3} sx={{ borderColor: '#ccc' }} />
          <Button
            sx={{ width: '100%' }}
            disabled={!isValid()}
            mt={2}
            onClick={handleIssue}
          >
            {signing ? (
              <Text>Pending sign in wallet</Text>
            ) : (
              <Text>
                Begin minting {formatCurrency(Number(amount))}{' '}
                {data.token.symbol}
              </Text>
            )}
          </Button>
        </>
      )}
    </Modal>
  )
}

export default ConfirmModal
