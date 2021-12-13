import { Contract } from '@ethersproject/contracts'
import {
  ContractCall,
  TransactionStatus,
  useContractFunction,
  useEthers,
} from '@usedapp/core'
import { useContract } from 'hooks/useContract'
import { ERC20 as IERC20 } from 'abis/types'
import React, { useEffect, useMemo } from 'react'
import {
  setTransactionHash,
  TransactionState,
  TX_STATUS,
  updateTransactionStatus,
  useTransactionsState,
} from 'state/context/TransactionManager'
import useTokensHasAllowance from 'hooks/useTokensHasAllowance'

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

export interface IRequiredApproveTransactionParams {
  method: string // method that requires allowance
  hasAllowance: boolean // if the user has the required allowance to execute "method"
  call: ContractCall // current call
  contract: Contract // current contract call
  account: string // current account
  send: (...args: any[]) => Promise<void> // Current contract execute function (uses multicall)
  dispatch: React.Dispatch<{ type: string; payload: any }> // Dispatch for updating context store
}

export const processRequiredApproveTransaction = async ({
  method,
  call,
  contract,
  account,
  hasAllowance,
  send,
  dispatch,
}: IRequiredApproveTransactionParams) => {
  if (call.method === 'approve') {
    const allowance = await (contract as IERC20).allowance(
      account,
      call.args[0]
    )

    if (allowance.gte(call.args[1])) {
      updateTransactionStatus(dispatch, TX_STATUS.SKIPPED)
    } else {
      send(...call.args)
      updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
    }
  } else if (call.method === method && hasAllowance) {
    send(...call.args)
    updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
  }
}

export interface IWorker {
  current: TransactionState
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

export interface IWithApprovalTransactionWorker extends IWorker {
  method: string
}

const WithApprovalTransactionWorker = ({
  current,
  method,
  dispatch,
}: IWithApprovalTransactionWorker) => {
  const { account } = useEthers()
  const contract = useContract(
    current.call.address,
    current.call.abi,
    false
  ) as Contract
  const { state, send } = useContractFunction(contract, current.call.method, {
    transactionName: current.description,
  })
  const hasAllowance = useTokensHasAllowance(
    current.call.method === method ? current.extra : [],
    current.call.address || ''
  )

  useEffect(() => {
    if (current.status === TX_STATUS.PENDING && !current.autoCall) {
      processRequiredApproveTransaction({
        method,
        account: account as string,
        contract,
        send,
        call: current.call,
        hasAllowance,
        dispatch,
      })
    }
  }, [contract, hasAllowance])

  // React to transaction state changes
  useEffect(() => {
    handleTransactionStatus(current, state, dispatch)
  }, [state.status])

  return null
}

const Worker = ({ current }: IWorker) => {
  const contract = useContract(
    current.call.address,
    current.call.abi,
    false
  ) as Contract
  const { state, send } = useContractFunction(contract, current.call.method, {
    transactionName: current.description,
  })
  const [, dispatch] = useTransactionsState()

  // Execute transaction
  useEffect(() => {
    // Only process pending transactions that can be automatically called
    if (current.status === TX_STATUS.PENDING && current.autoCall) {
      send(...current.call.args)
      updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
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

/**
 * Handle transactions that requires token approvals to be done prior to that
 */
export const RequiredApprovedTransactionWorker = ({
  method,
  autoCalls,
}: {
  method: string
  autoCalls: boolean
}) => {
  const [txState, dispatch] = useTransactionsState()
  const current = txState.list[txState.current]

  if (!current) {
    return null
  }

  // If autoCalls boolean is true and this is a normal call, return the generic Worker
  if (current.autoCall && autoCalls) {
    return <Worker current={current} dispatch={dispatch} />
  }

  return (
    <WithApprovalTransactionWorker
      method={method}
      current={current}
      dispatch={dispatch}
    />
  )
}

export default TransactionWorker
