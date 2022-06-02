import { BigNumber } from '@ethersproject/bignumber'
import { formatEther, formatUnits } from '@ethersproject/units'
import { ERC20Interface } from 'abis'
import { useFacadeContract } from 'hooks/useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReserveToken, StringMap } from 'types'
import { stringToColor } from 'utils'
import { useContractCalls } from './useCall'

/**
 * Returns a hash of balances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useAssets = (data: ReserveToken, marketCap: BigNumber): StringMap[] => {
  const [calls, setCalls] = <any>useState([])
  const [currentAssets, setAssets] = useState(<{ [x: string]: BigNumber }>{})
  const facadeContract = useFacadeContract()

  const getAssets = useCallback(
    async (abort: { value: boolean }) => {
      if (facadeContract) {
        try {
          const result = await facadeContract.callStatic.currentAssets(
            data.address
          )
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

          if (!abort.value) {
            setAssets(assetAmounts)
            setCalls(contractCalls)
          }
        } catch (e) {
          console.error('failed to fetch assets', e)
        }
      }
    },
    [facadeContract]
  )

  useEffect(() => {
    const abort = { value: false }
    getAssets(abort)

    return () => {
      abort.value = true
    }
  }, [facadeContract])

  const result = <any[]>useContractCalls(data.isRSV ? [] : calls) ?? []

  return useMemo(() => {
    if (data.isRSV) {
      const distribution = parseFloat(formatEther(marketCap.div(3)))

      return data.collaterals.map((collateral) => ({
        name: collateral.name,
        decimals: collateral.decimals,
        symbol: collateral.symbol,
        address: collateral.address,
        value: distribution,
        fill: stringToColor(collateral.name + collateral.symbol),
      }))
    }

    let resultIndex = 0

    return Object.keys(currentAssets).map((address, index) => {
      const [name] = result[resultIndex]?.value || ['']
      const [decimals] = result[resultIndex + 1]?.value || ['']
      const [symbol] = result[resultIndex + 2]?.value || ['']

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
  }, [data.address, result[0], marketCap.toHexString()])
}

export default useAssets
