import { Contract } from '@ethersproject/contracts'
import { TransactionStatus, useContractFunction } from '@usedapp/core'
import { useContract } from 'hooks/useContract'
import React, { useEffect, useMemo } from 'react'
import {
  setTransactionHash,
  TransactionState,
  TX_STATUS,
  updateTransactionStatus,
  useTransactionsState,
} from 'state/context/TransactionManager'

export const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  ISSUE: 'issue',
}

export const handleTransactionStatus = (
  current: TransactionState,
  state: TransactionStatus,
  dispatch: React.Dispatch<{ type: string; payload: any }>
) => {
  if (!current.hash && state.transaction?.hash) {
    setTransactionHash(dispatch, state.transaction.hash)
  }

  if (state.status === 'Success') {
    updateTransactionStatus(dispatch, TX_STATUS.SUBMITTED)
  }

  if (state.status === 'Exception' || state.status === 'Fail') {
    updateTransactionStatus(dispatch, TX_STATUS.FAILED)
  }
}

const Worker = ({
  current,
  dispatch,
}: {
  current: TransactionState
  dispatch: React.Dispatch<{ type: string; payload: any }>
}) => {
  const contract = useContract(
    current.call.address,
    current.call.abi,
    false
  ) as Contract
  const { state, send } = useContractFunction(contract, current.call.method, {
    transactionName: current.description,
  })

  // Execute transaction
  useEffect(() => {
    console.log('test how many times it enters here')
    const processTransaction = async () => {
      send(...current.call.args)
      updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
    }

    // Only process pending transactions that can be automatically called
    if (current.status === TX_STATUS.PENDING && current.autoCall) {
      processTransaction()
    }
  }, [current])

  // React to transaction state changes
  useEffect(() => {
    handleTransactionStatus(current, state, dispatch)
  }, [state.status])

  return null
}

/**
 * Handle general transactions without any checks or specific actions
 */
const TransactionWorker = () => {
  const [txState, dispatch] = useTransactionsState()
  const current = txState.list[txState.current]

  if (!current) {
    return null
  }

  return <Worker current={current} dispatch={dispatch} />
}

export default TransactionWorker
