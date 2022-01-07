import { Provider } from '@ethersproject/providers'
import { useEthers, useMulticallAddress } from '@usedapp/core'
import { Multicall, CallReturnContext } from 'ethereum-multicall'
import { useMemo } from 'react'
import { StringMap } from 'types'
import ERC20Abi from 'abis/ERC20.json'

export const tokenInfoCalls = [
  { reference: 'symbol', methodName: 'symbol', methodParameters: [] },
  { reference: 'name', methodName: 'name', methodParameters: [] },
  { reference: 'decimals', methodName: 'decimals', methodParameters: [] },
]

interface ITokenInfo {
  symbol: string
  name: string
  decimals: number
  address: string
}

export const mapContractResults = (calls: CallReturnContext[]): StringMap =>
  calls.reduce(
    (result, callResult) => ({
      ...result,
      [callResult.reference]: callResult.returnValues[0],
    }),
    {}
  )

export const getTokenInfo = async (
  multicall: Multicall,
  contractAddress: string
): Promise<ITokenInfo> => {
  const {
    results: { result },
  } = await multicall.call({
    reference: 'result',
    contractAddress,
    abi: ERC20Abi,
    calls: tokenInfoCalls,
  })

  return <ITokenInfo>{
    ...mapContractResults(result.callsReturnContext),
    address: contractAddress,
  }
}

export const getTokensInfo = async (
  multicall: Multicall,
  contractAddresses: string[]
): Promise<ITokenInfo[]> => {
  const { results } = await multicall.call(
    contractAddresses.map((contractAddress) => ({
      reference: contractAddress,
      contractAddress,
      abi: ERC20Abi,
      calls: tokenInfoCalls,
    }))
  )

  return Object.entries(results).map(
    ([address, result]) =>
      <ITokenInfo>{
        ...mapContractResults(result.callsReturnContext),
        address,
      }
  )
}

const useMulticall = (): Multicall | undefined => {
  const address = useMulticallAddress()
  const { library } = useEthers()

  return useMemo(
    () =>
      library && address
        ? new Multicall({
            ethersProvider: <Provider>library,
            multicallCustomContractAddress: address,
          })
        : undefined,
    [library, address ?? '']
  )
}

export default useMulticall
