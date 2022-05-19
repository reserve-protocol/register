import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { pendingTxAtom, updateTransactionAtom } from 'state/atoms'
import { TransactionState } from 'types'
import { getContract } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { error, signed, success } from '../lib/notifications'

const TransactionManager = () => {
  const setTxs = useUpdateAtom(updateTransactionAtom)
  const { pending, mining } = useDebounce(useAtomValue(pendingTxAtom), 100)
  const { account, provider } = useWeb3React()
  const blockNumber = useBlockNumber()

  const checkMiningTx = useCallback(
    async (txs: [number, TransactionState][]) => {
      for (const [index, tx] of txs) {
        try {
          const receipt = await provider?.getTransactionReceipt(tx.hash ?? '')
          if (receipt) {
            if (tx?.call.method !== 'approve') {
              success('Transaction confirmed', tx.description)
            }
            setTxs([
              index,
              { ...tx, status: TRANSACTION_STATUS.CONFIRMED, receipt },
            ])
          }
        } catch (e) {
          console.error('error getting receipt', e)
        }
      }
    },
    [provider]
  )

  // check mining
  useEffect(() => {
    if (provider && mining.length) {
      checkMiningTx(mining)
    }
  }, [blockNumber, mining])

  // process pending
  useEffect(() => {
    if (provider && account) {
      for (const [index, tx] of pending) {
        setTxs([index, { ...tx, status: TRANSACTION_STATUS.SIGNING }])

        const contract = getContract(
          tx.call.address,
          tx.call.abi,
          provider as Web3Provider,
          account
        )

        contract[tx.call.method](...tx.call.args)
          .then(({ hash }: { hash: string }) => {
            // TODO: Handle case account change after approve tx
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.MINING, hash }])
            if (tx?.call.method !== 'approve') {
              signed()
            }
          })
          .catch(() => {
            if (tx?.call.method !== 'approve') {
              error('Transaction reverted', tx.description)
            }
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.REJECTED }])
          })
      }
    }
  }, [pending])

  return null
}

export default TransactionManager
