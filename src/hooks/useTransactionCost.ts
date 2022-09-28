import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import abis from 'abis'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethPriceAtom, gasPriceAtom } from 'state/atoms'
import { error } from 'state/web3/lib/notifications'
import { TransactionState } from 'types'
import { getContract } from 'utils'

export const useTransactionGasFee = (
  transactions: TransactionState[]
): { loading: boolean; value: number[]; error: string } => {
  const { provider, account } = useWeb3React()
  const [state, setState] = useState({
    loading: false,
    value: [] as number[],
    error: '',
  })

  const fetchTxFees = useCallback(
    async (txs: TransactionState[]) => {
      if (txs.length && provider) {
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
              const parsed = +formatEther(estimate)
              totalFee += parsed
              return parsed
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
      }
    },
    [JSON.stringify(transactions), provider, account]
  )

  useEffect(() => {
    fetchTxFees(transactions)
  }, [fetchTxFees])

  return state
}

const useTransactionCost = (
  transactions: TransactionState[]
): [number, string] => {
  const { value: fees, error } = useTransactionGasFee(transactions)
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)

  return useMemo(
    () => [
      fees.reduce((acc, fee) => acc + fee, 0) * gasPrice * ethPrice,
      error,
    ],
    [fees, gasPrice, ethPrice, error]
  )
}

export default useTransactionCost
