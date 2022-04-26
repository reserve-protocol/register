import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import {
  pendingTxAtom,
  selectedAccountAtom,
  txAtom,
  updateTransactionAtom,
} from 'state/atoms'
import { getContract } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'

const Transactions = () => {
  const setTxs = useUpdateAtom(updateTransactionAtom)
  // TODO: should I debounce the value
  const { pending, mining, validating } = useDebounce(
    useAtomValue(pendingTxAtom),
    100
  )
  const { account, provider } = useWeb3React()
  const blockNumber = useBlockNumber()

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

        contract[tx.call.method](...tx.call.args).then(
          ({ hash }: { hash: string }) => {
            // TODO: Handle case account change and after approve tx
            setTxs([index, { ...tx, status: TRANSACTION_STATUS.MINING, hash }])
          }
        )
      }
    }
  }, [pending])

  // check mining
  useEffect(() => {
    console.log('check mining txs', mining)
  }, [blockNumber, mining])

  return null
}

export default Transactions
