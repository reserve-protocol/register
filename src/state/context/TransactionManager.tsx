import { Contract } from '@ethersproject/contracts'
import { ContractCall } from '@usedapp/core'
import React, { useContext, useReducer } from 'react'

const ACTIONS = {
  ADD: 'ADD',
  SET: 'SET',
  UPDATE_STATUS: 'UPDATE_STATUS',
}

export const TX_STATUS = {
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  SUBMITTED: 'SUBMITTED',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
}

const TransactionsContext = React.createContext({})

export interface TransactionState {
  hash?: string
  description: string
  status: string
  value: string
  call: ContractCall
  extra?: any
}

interface IState {
  list: TransactionState[]
  current: number
}

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
      const index = action.payload.index || state.current
      let tx = state.list[index]

      if (!tx) {
        console.error('Transaction not found')
      }

      tx = { ...tx, status: action.payload.data }

      let { current } = state

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
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

interface ContextValue {
  state: IState
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const TransactionManager = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { list: [], current: 0 })
  const value = { state, dispatch }

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
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

export default TransactionManager
