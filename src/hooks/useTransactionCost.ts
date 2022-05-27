import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import abis from 'abis'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethPriceAtom, gasPriceAtom } from 'state/atoms'
import { TransactionState } from 'types'
import { getContract } from 'utils'

export const useTransactionGasFee = (
  transactions: TransactionState[]
): { loading: boolean; value: number[] } => {
  const { provider, account } = useWeb3React()
  const [state, setState] = useState({ loading: false, value: [] as number[] })

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

          setState({ value: result, loading: false })
        } catch (e) {
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

const useTransactionCost = (transactions: TransactionState[]): number => {
  const { value: fees } = useTransactionGasFee(transactions)
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)

  return useMemo(
    () => fees.reduce((acc, fee) => acc + fee, 0) * gasPrice * ethPrice,
    [fees, gasPrice, ethPrice]
  )
}

export default useTransactionCost
