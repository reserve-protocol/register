import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import {
  allowanceAtom,
  pendingTxAtom,
  updateTransactionAtom,
} from 'state/atoms'
import { getContract, hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'

const Transactions = () => {
  const setTxs = useUpdateAtom(updateTransactionAtom)
  // TODO: should I debounce the value?
  const { pending, mining, validating } = useDebounce(
    useAtomValue(pendingTxAtom),
    100
  )
  const allowances = useAtomValue(allowanceAtom)
  const { account, provider } = useWeb3React()
  const blockNumber = useBlockNumber()

  const checkMiningTx = useCallback(
    async (txs: any) => {
      for (const [index, tx] of txs) {
        try {
          const receipt = await provider?.getTransactionReceipt(tx.hash)
          if (receipt) {
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.CONFIRMED }])
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
            // TODO: Handle case account change and after approve tx
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.MINING, hash }])
          })
          .catch(() => {
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.REJECTED }])

            console.log('failed tx', tx)
            // Cancel pending allowance tx
            if (tx.call.method === 'approve') {
              console.log('find validate tx', tx.call.args[0])
              console.log('validating', validating)
              const validatingTx = validating.find(([, vTx]) => {
                console.log('current tx checking', tx)
                console.log('address to be check', tx.call.args[0])
                return vTx.call.address === tx.call.args[0]
              })

              console.log('validating tx', validatingTx)

              if (validatingTx) {
                setTxs([
                  validatingTx[0],
                  { ...validatingTx[1], status: TRANSACTION_STATUS.REJECTED },
                ])
              }
            }
          })
      }
    }
  }, [pending])

  // Move tx waiting for allowance to the pending queue
  useEffect(() => {
    if (provider && account && validating.length) {
      for (const [index, tx] of validating) {
        if (hasAllowance(allowances, tx.extra)) {
          // Mark transactions with required allowances as pending so they can be processed normally
          setTxs([index, { ...tx, status: TRANSACTION_STATUS.PENDING }])
        }
      }
    }
  }, [JSON.stringify(allowances)])

  return null
}

export default Transactions
