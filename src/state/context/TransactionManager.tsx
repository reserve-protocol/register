import { ContractCall } from '@usedapp/core'
import React, { useContext, useReducer } from 'react'

const ACTIONS = {
  ADD: 'ADD',
}

const TransactionsContext = React.createContext({})

export interface TransactionState {
  hash?: string
  description: string
  status: string
  call: ContractCall
  canExecute: boolean
}

interface IState {
  list: TransactionState[]
}

function reducer(state: IState, action: { type: string; payload: any }) {
  switch (action.type) {
    case ACTIONS.ADD: {
      return { ...state, list: [...state.list, action.payload] }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

interface ContextValue {
  state: TransactionState
  dispatch: React.Dispatch<{ type: string; payload: any }>
}

const TransactionManager = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { list: [] })
  const value = { state, dispatch }

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactionsState = (): [
  TransactionState,
  ContextValue['dispatch']
] => {
  const { state, dispatch } = useContext(TransactionsContext) as ContextValue

  return [state, dispatch]
}

export const loadTransactions = (
  dispatch: ContextValue['dispatch'],
  transactions: TransactionState[]
) => {
  dispatch({ type: ACTIONS.ADD, payload: transactions })
}

export default TransactionManager
