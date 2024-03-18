import {
  Address,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi'
import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'
import { useEffect } from 'react'

const ZapConfirmButton = () => {
  const { zapResult, setOpenSubmitModal, chainId, onExecuteTx } = useZap()

  const { config } = usePrepareSendTransaction(
    zapResult
      ? {
          data: zapResult.tx.data as Address,
          gas: BigInt(zapResult.gas),
          to: zapResult.tx.to as Address,
          value: BigInt(zapResult.tx.value),
        }
      : undefined
  )

  const { data, isLoading, sendTransaction } = useSendTransaction(config)

  const { data: receipt } = useWaitForTransaction({
    hash: data?.hash,
    chainId,
  })

  useEffect(() => {
    if (receipt) setOpenSubmitModal(false) // TODO: show success modal
  }, [receipt, setOpenSubmitModal])

  return (
    <LoadingButton
      onClick={() => sendTransaction?.()}
      loading={!zapResult || isLoading}
      text="Confirm Mint"
      fullWidth
    />
  )
}

export default ZapConfirmButton
