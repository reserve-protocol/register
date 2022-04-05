import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { ContractCall } from 'hooks/useCall'
import { useContract } from 'hooks/useContract'
import useTokensHasAllowance from 'hooks/useTokensHasAllowance'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect } from 'react'
import {
  currentTransactionAtom,
  transactionAtom,
  transactionsAtom,
} from 'state/atoms'
import { TX_STATUS } from 'state/context/TransactionManager'

export interface IRequiredApproveTransactionParams {
  methods: string[] // method that requires allowance
  hasAllowance: boolean // if the user has the required allowance to execute "method"
  call: ContractCall // current call
  contract: Contract // current contract call
  account: string // current account
  send: (...args: any[]) => Promise<void> // Current contract execute function (uses multicall)
  dispatch: React.Dispatch<{ type: string; payload: any }> // Dispatch for updating context store
}

const requiredApprovalTx = ['stake', 'issue', 'redeem']

const updateTransactionAtom = atom(null, (get, set, status: string) => {
  const txs = get(transactionsAtom)
  let currentTx = get(currentTransactionAtom)

  if (!txs[currentTx]) {
    throw new Error('Tx not found')
  }

  const result = [...txs.slice(0, currentTx), { ...txs[currentTx], status }]

  let pending = txs.slice(currentTx + 1)

  if (
    status === TX_STATUS.SKIPPED ||
    status === TX_STATUS.CONFIRMED ||
    status === TX_STATUS.FAILED
  ) {
    currentTx += 1

    if (status === TX_STATUS.FAILED && txs[currentTx - 1].batchId) {
      pending = pending.map((tx) => {
        if (tx.batchId === txs[currentTx].batchId) {
          currentTx += 1
          return {
            ...tx,
            status: TX_STATUS.FAILED,
          }
        }

        return tx
      })
    }
  }

  result.push(...pending)
  set(currentTransactionAtom, currentTx)
  set(transactionsAtom, result)
})

const updateTransactionHashAtom = atom(null, (get, set, hash: string) => {
  const txs = get(transactionsAtom)
  const currentTx = get(currentTransactionAtom)

  set(transactionsAtom, [
    ...txs.slice(0, currentTx),
    { ...txs[currentTx], hash },
    ...txs.slice(currentTx + 1),
  ])
})

const TransactionWorker = () => {
  const current = useAtomValue(transactionAtom)!
  const { account } = useWeb3React()
  const updateTx = useSetAtom(updateTransactionAtom)
  const updateTxHash = useSetAtom(updateTransactionHashAtom)
  const contract = useContract(
    current.call.address,
    current.call.abi,
    false
  ) as Contract

  const hasAllowance = useTokensHasAllowance(
    requiredApprovalTx.includes(current.call.method) ? current.extra : [],
    current.call.address || ''
  )

  const exec = async () => {
    try {
      const transaction = await current.call.contract(...current.call.args)
      updateTxHash(transaction.hash)
      await transaction.wait()
      updateTx(TX_STATUS.CONFIRMED)
    } catch (e) {
      updateTx(TX_STATUS.FAILED)
    }
  }

  // TODO: useCallback
  const processTx = async () => {
    updateTx(TX_STATUS.PROCESSING)
    if (current.call.method === 'approve') {
      const allowance = await contract.allowance(account, current.call.args[0])

      if (allowance.gte(current.call.args[1])) {
        updateTx(TX_STATUS.SKIPPED)
      } else {
        exec()
      }
    } else if (
      !requiredApprovalTx.includes(current.call.method) ||
      hasAllowance
    ) {
      exec()
    }
  }

  useEffect(() => {
    if (current.status === TX_STATUS.PENDING && !current.autoCall) {
      processTx()
    }
  }, [contract, hasAllowance])

  return null
}

// TODO: Can be improved with jotai in mind
const TransactionManager = () => {
  const current = useAtomValue(transactionAtom)

  if (!current) {
    return null
  }

  return <TransactionWorker />
}

export default TransactionManager
