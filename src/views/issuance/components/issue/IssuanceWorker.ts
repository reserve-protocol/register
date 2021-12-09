import { Contract } from '@ethersproject/contracts'
import { useContractFunction, useEthers } from '@usedapp/core'
import { ERC20 as IERC20 } from 'abis/types'
import { useContract } from 'hooks/useContract'
import useTokensHasAllowance from 'hooks/useTokensHasAllowance'
import React, { useEffect } from 'react'
import {
  TransactionState,
  TX_STATUS,
  updateTransactionStatus,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { handleTransactionStatus } from 'state/context/TransactionWorker'

export const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  ISSUE: 'issue',
}

/**
 * Handle issuance related transactions
 */
const IssuanceWorker = React.memo(
  ({ current }: { current: TransactionState }) => {
    const { account } = useEthers()
    const contract = useContract(
      current.call.address,
      current.call.abi,
      false
    ) as Contract
    const [, dispatch] = useTransactionsState()
    const { state, send } = useContractFunction(contract, current.call.method, {
      transactionName: current.description,
    })
    const hasAllowance = useTokensHasAllowance(
      current.call.method === TRANSACTION_TYPES.ISSUE ? current.extra : [],
      current.call.address || ''
    )

    useEffect(() => {
      const processTransaction = async () => {
        if (current.call.method === TRANSACTION_TYPES.APPROVE) {
          const allowance = await (contract as IERC20).allowance(
            account as string,
            current.call.args[0]
          )

          if (allowance.gte(current.call.args[1])) {
            updateTransactionStatus(dispatch, TX_STATUS.SKIPPED)
          } else {
            send(...current.call.args)
            updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
          }
        } else if (
          current.call.method === TRANSACTION_TYPES.ISSUE &&
          hasAllowance
        ) {
          send(...current.call.args)
          updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
        }
      }

      if (current.status === TX_STATUS.PENDING && !current.autoCall) {
        processTransaction()
      }
    }, [contract, hasAllowance])

    // React to transaction state changes
    useEffect(() => {
      handleTransactionStatus(current, state, dispatch)
    }, [state.status])

    return null
  }
)

export default IssuanceWorker
