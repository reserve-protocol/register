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
  canExecute?: () => boolean
}

interface IState {
  list: TransactionState[]
}

function reducer(state: IState, action: { type: string, payload: any }) {
  switch (action.type) {
    case ACTIONS.ADD: {
      return { ...state, list: [...state.list, action.payload] }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
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

export const useTransactionsState = () => {
  const [state] = useContext(TransactionsContext)
}

export default TransactionManager
