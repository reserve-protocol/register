import { useWeb3React } from '@web3-react/core'
import {
  Distributor,
  ERC20Interface,
  FacadeInterface,
  MainInterface,
} from 'abis'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  Collateral,
} from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import { formatBytes32String, formatEther } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { rTokenAtom, rTokenCollateralDist } from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall, StringMap } from 'types'
import { getContract } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

/**
 * Get RToken primary basket
 */
const primaryBasketAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const basketDistribution = get(rTokenCollateralDist)

  return rToken?.collaterals.reduce((prev, { address, symbol }) => {
    if (!basketDistribution[address]) {
      return prev
    }

    const { targetUnit, share } = basketDistribution[address]
    let targetBasket = prev[targetUnit]
    const collateral = {
      targetUnit,
      address,
      symbol,
    }

    if (!targetBasket) {
      targetBasket = {
        scale: '',
        collaterals: [collateral],
        distribution: [share.toFixed(2)],
      }
    } else {
      targetBasket.collaterals.push(collateral)
      targetBasket.distribution.push(share.toFixed(2))
    }

    prev[targetUnit] = targetBasket
    return prev
  }, {} as Basket)
})

/**
 * Get RToken backup basket
 */
const useTokenBackup = (): {
  targetUnit: string
  max: number
  tokens: Collateral[]
}[] => {
  const { provider } = useWeb3React()
  const rToken = useRToken()
  const primaryBasket = useAtomValue(basketAtom)
  const setBackupBasket = useSetAtom(backupCollateralAtom)

  const setBackupConfig = async () => {
    const targetUnits = Object.keys(primaryBasket)

    if (!provider || !rToken || !targetUnits.length) {
      return
    }

    try {
      const calls = targetUnits.reduce(
        (prev, curr) => [
          ...prev,
          {
            address: FACADE_ADDRESS[CHAIN_ID],
            abi: FacadeInterface,
            method: 'backupConfig',
            args: [rToken.address, formatBytes32String(curr)],
          },
        ],
        [] as ContractCall[]
      )

      const multicallResult = await promiseMulticall(calls, provider)
      const backupBasket: BackupBasket = {}
      let index = 0

      for (const result of multicallResult) {
        const { erc20s, max }: { erc20s: string[]; max: BigNumber } = result

        const symbols: string[] = await promiseMulticall(
          erc20s.map((address) => ({
            address,
            abi: ERC20Interface,
            method: 'symbol',
            args: [],
          })),
          provider
        )

        backupBasket[targetUnits[index]] = {
          diversityFactor: +formatEther(max),
          collaterals: erc20s.map((address, i) => ({
            address,
            targetUnit: targetUnits[index],
            symbol: symbols[i],
          })),
        }
        index += 1
      }

      setBackupBasket(backupBasket)
    } catch (e) {
      console.warn('Error getting backup config', e)
    }
  }

  useEffect(() => {
    if (rToken && provider && !!Object.keys(primaryBasket)) {
      setBackupConfig()
    }
  }, [rToken?.address, primaryBasket, provider])

  return []
}

const useRTokenParameters = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const [revenueDistribution, setRevenueDistribution] = useState(
    {} as StringMap
  )

  const fetchParams = useCallback(async () => {
    if (rToken?.main && provider) {
      try {
        const [distribution] = await promiseMulticall(
          [
            {
              abi: MainInterface,
              address: rToken.main,
              args: [],
              method: 'distributor',
            },
          ],
          provider
        )

        const contract = getContract(distribution, Distributor, provider)
        const events = await contract.queryFilter(
          'DistributionSet(address,uint16,uint16)'
        )
        const dist: StringMap = {}
        for (const event of events) {
          if (event.args) {
            const { dest, rTokenDist, rsrDist } = event.args

            // Dist removed
            if (!rTokenDist && !rsrDist) {
              delete dist[dest]
            } else {
              dist[dest] = {
                rTokenDist: rTokenDist,
                rsrDist: rsrDist,
              }
            }
          }
        }

        console.log('dist', dist)
        setRevenueDistribution(dist)
      } catch (e) {
        console.error(e)
      }
    }
  }, [rToken, provider])

  useEffect(() => {
    fetchParams()
  }, [fetchParams])

  return [revenueDistribution]
}

const useRTokenMeta = () => {
  const basketDist = useAtomValue(primaryBasketAtom)
  const setPrimaryBasket = useSetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  useTokenBackup()
  useRTokenParameters()

  useEffect(() => {
    setPrimaryBasket(basketDist || {})
  }, [basketDist])

  useEffect(() => {
    return () => {
      setPrimaryBasket({})
      resetBackup()
    }
  }, [])

  return null
}

export default useRTokenMeta
