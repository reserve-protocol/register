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
import { getAddress } from '@ethersproject/address'
import { TRANSACTION_STATUS } from 'utils/constants'
import abis from 'abis'
import { error, signed, success } from '../lib/notifications'

const TransactionManager = () => {
  const setTxs = useUpdateAtom(updateTransactionAtom)
  const { pending, mining } = useDebounce(useAtomValue(pendingTxAtom), 200)
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
              {
                ...tx,
                status: TRANSACTION_STATUS.CONFIRMED,
                confirmedAt: receipt.blockNumber,
                updatedAt: +Date.now(),
              },
            ])
          }
        } catch (e) {
          console.error('error getting receipt', e)
        }
      }
    },
    [provider]
  )

  const processTxs = useCallback(
    (txs: [number, TransactionState][]) => {
      for (const [index, tx] of txs) {
        setTxs([
          index,
          { ...tx, status: TRANSACTION_STATUS.SIGNING, createdAt: +Date.now() },
        ])

        const contract = getContract(
          tx.call.address,
          abis[tx.call.abi],
          provider as Web3Provider,
          account
        )

        contract[tx.call.method](...tx.call.args)
          .then(({ hash }: { hash: string }) => {
            setTxs([
              index,
              {
                ...tx,
                status: TRANSACTION_STATUS.MINING,
                updatedAt: +Date.now(),
                hash,
              },
            ])
            if (tx?.call.method !== 'approve') {
              signed()
            }
          })
          .catch((e: any) => {
            if (tx?.call.method !== 'approve') {
              error('Transaction reverted', tx.description)
            }
            setTxs([
              index,
              {
                ...tx,
                status: TRANSACTION_STATUS.REJECTED,
                updatedAt: +Date.now(),
                error: e?.data?.message ?? e.message,
              },
            ])
          })
      }
    },
    [provider]
  )

  // check mining
  useEffect(() => {
    if (provider && blockNumber && mining.length) {
      checkMiningTx(mining)
    }
  }, [blockNumber, JSON.stringify(mining)])

  // process pending
  useEffect(() => {
    if (provider && account && pending.length) {
      processTxs(pending)
    }
  }, [JSON.stringify(pending)])

  return null
}

export default TransactionManager
