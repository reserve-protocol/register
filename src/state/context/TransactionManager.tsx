import { ContractCall } from '@usedapp/core'
import React, { useContext, useReducer } from 'react'

export interface TransactionState {
  hash?: string
  description: string
  // TX_STATUS
  status: string
  value: string
  call: ContractCall
  // Extra props required to handle the transaction
  extra?: any
  // Defines if the transaction will be handled by the default worker
  // Used for TX with simple logic, like an `Approval` or `Transfer`
  autoCall: boolean
}

interface IState {
  list: TransactionState[]
  current: number
}

interface ContextValue {
  state: IState
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const ACTIONS = {
  ADD: 'ADD',
  SET: 'SET',
  UPDATE_STATUS: 'UPDATE_STATUS',
  SET_HASH: 'SET_HASH',
}

export const TX_STATUS = {
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  SUBMITTED: 'SUBMITTED',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
}

const TransactionsContext = React.createContext({})

function reducer(state: IState, action: { type: string; payload: any }) {
  switch (action.type) {
    case ACTIONS.ADD: {
      return {
        ...state,
        list: [...state.list, ...action.payload],
        current: state.current || 0,
      }
    }
    case ACTIONS.SET: {
      return { ...state, current: action.payload }
    }
    case ACTIONS.UPDATE_STATUS: {
      let { current } = state
      const index = action.payload.index || current
      const tx = { ...state.list[index], status: action.payload.data }

      if (
        current > -1 &&
        (action.payload.data === TX_STATUS.SKIPPED ||
          action.payload.data === TX_STATUS.SUBMITTED)
      ) {
        current += 1
      }

      return {
        list: [
          ...state.list.slice(0, index),
          tx,
          ...state.list.slice(index + 1),
        ],
        current,
      }
    }
    case ACTIONS.SET_HASH: {
      const index = action.payload.index || state.current

      return {
        ...state,
        list: [
          ...state.list.slice(0, index),
          { ...state.list[index], hash: action.payload.data },
          ...state.list.slice(index + 1),
        ],
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

export const useTransactionsState = (): [IState, ContextValue['dispatch']] => {
  const { state, dispatch } = useContext(TransactionsContext) as ContextValue

  return [state, dispatch]
}

export const useCurrentTransaction = () => {
  const [{ list, current }] = useTransactionsState()

  if (!current) {
    return null
  }

  return list[current]
}

export const loadTransactions = (
  dispatch: ContextValue['dispatch'],
  transactions: TransactionState[]
) => {
  dispatch({ type: ACTIONS.ADD, payload: transactions })
}

export const updateTransactionStatus = (
  dispatch: ContextValue['dispatch'],
  status: string,
  index?: number
) => {
  dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { data: status, index } })
}

export const setTransactionHash = (
  dispatch: ContextValue['dispatch'],
  hash: string,
  index?: number
) => {
  dispatch({ type: ACTIONS.SET_HASH, payload: { data: hash, index } })
}

/**
 * React.Context wrapper to handle transactions
 */
const TransactionManager = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { list: [], current: 0 })
  const value = { state, dispatch }

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export default TransactionManager
