import { TransactionReceipt, Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import abis, { DeployerInterface } from 'abis'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { pendingTxAtom, updateTransactionAtom } from 'state/atoms'
import { TransactionState } from 'types'
import { getContract } from 'utils'
import { DEPLOYER_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { error, signed, success } from '../lib/notifications'

const getDeployedRToken = (receipt: TransactionReceipt): string => {
  const log = receipt.logs.find(
    (logs) => logs.address === DEPLOYER_ADDRESS[CHAIN_ID]
  )

  if (log) {
    return DeployerInterface.parseLog(log).args.rToken as string
  }

  return ''
}

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

            const transaction = {
              ...tx,
              status: TRANSACTION_STATUS.CONFIRMED,
              confirmedAt: receipt.blockNumber,
              updatedAt: +Date.now(),
            }

            // Fill extra data with rToken address and persist it on localStorage
            // TODO: Show select rToken from tx sidebar
            if (transaction.call.method === 'deployRToken') {
              transaction.extra = {
                rTokenAddress: getDeployedRToken(receipt),
              }
            }

            setTxs([index, transaction])
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
            console.error('Transaction reverted', e)
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
