import OptimismPortal from 'abis/OptimismPortal'
import { useEffect, useState } from 'react'
import { OP_PORTAL } from '../utils/constants'
import { ChainId } from 'utils/chains'
import { WithdrawalMessage } from '../utils/types'
import { getWithdrawalMessage } from '../utils/getWithdrawalMessage'
import { useSimulateContract, useWaitForTransactionReceipt } from 'wagmi'

export function usePrepareFinalizeWithdrawal(withdrawalTx: `0x${string}`) {
  const [withdrawalForTx, setWithdrawalForTx] =
    useState<WithdrawalMessage | null>(null)

  const { data: withdrawalReceipt } = useWaitForTransactionReceipt({
    hash: withdrawalTx,
    chainId: ChainId.Base,
  })

  const shouldPrepare = withdrawalForTx

  const { data } = useSimulateContract({
    address: shouldPrepare ? OP_PORTAL : undefined,
    abi: OptimismPortal,
    functionName: 'finalizeWithdrawalTransaction',
    chainId: ChainId.Mainnet,
    args: shouldPrepare
      ? [
          {
            nonce: withdrawalForTx.nonce,
            sender: withdrawalForTx.sender,
            target: withdrawalForTx.target,
            value: withdrawalForTx.value,
            gasLimit: withdrawalForTx.gasLimit,
            data: withdrawalForTx.data,
          },
        ]
      : undefined,
    // TODO: not sure about adding TOS for indexer API
    // dataSuffix: '0x01,
  })

  useEffect(() => {
    if (withdrawalReceipt) {
      const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt)
      setWithdrawalForTx(withdrawalMessage)
    }
  }, [withdrawalReceipt])

  return data
}
