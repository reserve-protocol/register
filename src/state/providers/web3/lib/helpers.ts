import { utils } from 'ethers'
import { Call } from 'hooks/useCall'
import {
  ContractMethodNames,
  RawCallResult,
  Falsy,
  Awaited,
  TypedContract,
  RawCall,
} from 'types'

export function warnOnInvalidCall(call: Call | Falsy) {
  if (!call) {
    return
  }
  const { contract, method, args } = call
  console.warn(
    `Invalid contract call: address=${contract.address} method=${method} args=${args}`
  )
}

export function encodeCallData(call: Call | Falsy): RawCall | Falsy {
  if (!call) {
    return undefined
  }
  const { contract, method, args } = call
  if (!contract.address || !method) {
    warnOnInvalidCall(call)
    return undefined
  }
  try {
    return {
      address: contract.address,
      data: contract.interface.encodeFunctionData(method, args),
    }
  } catch {
    warnOnInvalidCall(call)
    return undefined
  }
}

export type CallResult<
  T extends TypedContract,
  MN extends ContractMethodNames<T>
> =
  | { value: Awaited<ReturnType<T['functions'][MN]>>; error: undefined }
  | { value: undefined; error: Error }
  | undefined

export function decodeCallResult<
  T extends TypedContract,
  MN extends ContractMethodNames<T>
>(call: Call | Falsy, result: RawCallResult): CallResult<T, MN> {
  if (!result || !call) {
    return undefined
  }
  const { value, success } = result
  try {
    if (success) {
      return {
        value: call.contract.interface.decodeFunctionResult(
          call.method,
          value
        ) as Awaited<ReturnType<T['functions'][MN]>>,
        error: undefined,
      }
    }
    const errorMessage: string = new utils.Interface([
      'function Error(string)',
    ]).decodeFunctionData('Error', value)[0]
    return {
      value: undefined,
      error: new Error(errorMessage),
    }
  } catch (error) {
    return {
      value: undefined,
      error: error as Error,
    }
  }
}
