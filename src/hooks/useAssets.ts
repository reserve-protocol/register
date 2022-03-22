import { ERC20Interface, useContractCalls } from '@usedapp/core'
import { formatUnits } from 'ethers/lib/utils'
import { useFacadeContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import { ReserveToken, StringMap } from 'types'
import { stringToColor } from 'utils'

/**
 * Returns a hash of balances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useAssets = (data: ReserveToken): StringMap[] => {
  const [calls, setCalls] = <any>useState([])
  const [currentAssets, setAssets] = useState(<StringMap>{})
  const facadeContract = useFacadeContract(data.facade)

  const getAssets = async () => {
    if (facadeContract) {
      const result = await facadeContract.callStatic.currentAssets()
      const contractCalls = []

      // TODO: Merge arrays
      for (const asset of result.tokens) {
        const params = {
          abi: ERC20Interface,
          address: asset,
          args: [],
        }

        contractCalls.push({
          ...params,
          method: 'name',
        })
        contractCalls.push({
          ...params,
          method: 'decimals',
        })
        contractCalls.push({
          ...params,
          method: 'symbol',
        })
      }

      setAssets(
        result.tokens.reduce((prev, current, index) => {
          if (result.amounts[index].gt(0)) {
            prev[current] = result.amounts[index]
          }

          return prev
        }, <StringMap>{})
      )
      setCalls(contractCalls)
    }
  }

  useEffect(() => {
    getAssets()
  }, [data.id])

  const result = <any[]>useContractCalls(calls) ?? []

  if (data.isRSV) {
    return data.basket.collaterals.map((collateral) => ({
      name: collateral.token.name,
      decimals: collateral.token.decimals,
      symbol: collateral.token.symbol,
      index: collateral.index,
      address: collateral.token.address,
      value: 0,
      fill: stringToColor(collateral.token.name + collateral.token.symbol),
    }))
  }

  let resultIndex = 0

  console.log('current assets', currentAssets)

  return Object.keys(currentAssets).map((address, index) => {
    const [name] = result[resultIndex] || ['']
    const [decimals] = result[resultIndex + 1] || ['']
    const [symbol] = result[resultIndex + 2] || ['']

    resultIndex += 3

    return {
      name,
      decimals,
      symbol,
      index,
      address,
      value: decimals ? formatUnits(currentAssets[address], decimals) : 0,
      fill: stringToColor(`${name}${symbol}`),
    }
  })
}

export default useAssets
