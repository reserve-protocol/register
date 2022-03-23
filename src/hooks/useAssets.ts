import { BigNumber } from '@ethersproject/bignumber'
import { ERC20Interface, useContractCalls } from '@usedapp/core'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { useFacadeContract } from 'hooks/useContract'
import { useEffect, useMemo, useState } from 'react'
import { ReserveToken, StringMap } from 'types'
import { stringToColor } from 'utils'

/**
 * Returns a hash of balances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useAssets = (data: ReserveToken, marketCap: BigNumber): StringMap[] => {
  const [calls, setCalls] = <any>useState([])
  const [currentAssets, setAssets] = useState(<{ [x: string]: BigNumber }>{})
  const facadeContract = useFacadeContract(data.facade)

  const getAssets = async () => {
    if (facadeContract) {
      const result = await facadeContract.callStatic.currentAssets()
      const contractCalls = []
      const assetAmounts: { [x: string]: BigNumber } = {}

      for (let i = 0; i < result.tokens.length; i++) {
        const address = result.tokens[i]
        const amount = result.amounts[i]
        const params = {
          abi: ERC20Interface,
          address,
          args: [],
        }

        if (!amount.isZero()) {
          // Add contract calls to get token info
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
          // Fill asset amounts
          assetAmounts[address] = amount
        }
      }

      setAssets(assetAmounts)
      setCalls(contractCalls)
    }
  }

  useEffect(() => {
    getAssets()
  }, [data.id])

  const result = <any[]>useContractCalls(data.isRSV ? [] : calls) ?? []

  return useMemo(() => {
    if (data.isRSV) {
      const distribution = parseFloat(formatEther(marketCap.div(3)))

      return data.basket.collaterals.map((collateral) => ({
        name: collateral.token.name,
        decimals: collateral.token.decimals,
        symbol: collateral.token.symbol,
        index: collateral.index,
        address: collateral.token.address,
        value: distribution,
        fill: stringToColor(collateral.token.name + collateral.token.symbol),
      }))
    }

    let resultIndex = 0

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
        value: decimals
          ? parseFloat(formatUnits(currentAssets[address], decimals))
          : 0,
        fill: stringToColor(`${name}${symbol}`),
      }
    })
  }, [data.id, result[0], marketCap.toHexString()])
}

export default useAssets
