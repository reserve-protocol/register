import { Web3Provider } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import abis from 'abis'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethPriceAtom, gasPriceAtom, getValidWeb3Atom } from 'state/atoms'
import { error } from 'state/chain/lib/notifications'
import { TransactionState } from 'types'
import { getContract } from 'utils'

export const useTransactionGasFee = (
  transactions: TransactionState[]
): { loading: boolean; value: number[]; error: string } => {
  const { provider, account } = useAtomValue(getValidWeb3Atom)
  const [state, setState] = useState({
    loading: false,
    value: [] as number[],
    error: '',
  })

  const fetchTxFees = useCallback(
    async (
      provider: Web3Provider,
      txs: TransactionState[],
      account: string
    ) => {
      setState({ ...state, loading: true })
      let totalFee = 0

      try {
        const result = await Promise.all(
          txs.map(async (tx) => {
            const contract = getContract(
              tx.call.address,
              abis[tx.call.abi],
              provider as Web3Provider,
              account
            )

            const estimate = await contract.estimateGas[tx.call.method](
              ...tx.call.args
            )
            totalFee += estimate.toNumber()
            return estimate.toNumber()
          })
        )

        setState({ value: result, loading: false, error: '' })
      } catch (e: any) {
        error(t`Error estimating fees`, t`Transaction failed`)
        setState({
          value: [],
          loading: false,
          error: e?.error?.message || t`Error running transaction`,
        })
        console.error('error fetching gas fees', e)
      }
    },
    []
  )

  useEffect(() => {
    if (provider && account && transactions.length) {
      fetchTxFees(provider, transactions, account)
    }
  }, [provider, account, JSON.stringify(transactions)])

  return state
}

const useTransactionCost = (
  transactions: TransactionState[]
): [number, string, number] => {
  return [1, '', 1]
}

export default useTransactionCost
