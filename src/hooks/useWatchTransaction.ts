import { Hex } from 'viem'
import useNotification from './useNotification'
import { useWaitForTransaction } from 'wagmi'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

const useWatchTransaction = (
  hash: Hex | undefined,
  successMsg?: string,
  errorMsg?: string
) => {
  const notify = useNotification()
  const result = useWaitForTransaction({
    hash,
  })

  useEffect(() => {
    if (result.isError) {
      notify(
        t`Transaction failed`,
        errorMsg ?? result.error?.message ?? 'Unknown error',
        'error'
      )
    }

    if (result.isSuccess) {
      notify(
        t`Transaction confirmed`,
        successMsg ?? `At block ${Number(result.data?.blockNumber ?? 0n)}`,
        'success'
      )
    }
  }, [result.status, notify])

  return result
}

export default useWatchTransaction
