import type { ContractCall } from '@reserve-protocol/react-sdk'
import type { UseWriteContractReturnType } from 'wagmi'

type WriteContractParams = Parameters<
  UseWriteContractReturnType['writeContract']
>[0]

export const getWriteContractParams = (
  call: ContractCall
): WriteContractParams =>
  ({
    address: call.contract.address,
    abi: call.contract.abi,
    functionName: call.contract.functionName,
    args: call.contract.args,
    chainId: call.chainId,
    value: call.value,
  }) as unknown as WriteContractParams

export const isSameAddress = (left?: string | null, right?: string | null) =>
  !!left && !!right && left.toLowerCase() === right.toLowerCase()
