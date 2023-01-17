import { useWeb3React } from '@web3-react/core'
import {
  Asset as AssetAbi,
  AssetRegistryInterface,
  BackingManagerInterface,
  BrokerInterface,
  Distributor as DistributorAbi,
  ERC20Interface,
  FacadeInterface,
  FurnaceInterface,
  MainInterface,
  RevenueTraderInterface,
  RTokenInterface,
  StRSRInterface,
} from 'abis'
import { Asset } from 'abis/types'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  Collateral,
  RevenueSplit,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import { formatBytes32String, formatEther } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
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

const shareToPercent = (shares: number): string => {
  return Math.floor((shares * 100) / 10000).toString()
}

// TODO: Refactor the whole fetch layer for an rToken
// TODO: Start doing and SDK like way to fetch all this data
// TODO: Promise base layer or react sdk?
const useRTokenParameters = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const setRevenueSplit = useSetAtom(revenueSplitAtom)

  const fetchParams = useCallback(async () => {
    if (rToken?.main && provider) {
      try {
        const mainCall = { abi: MainInterface, address: rToken.main, args: [] }
        // TODO: Fetch addresses and store it in an atom
        const [
          distribution,
          backingManager,
          rTokenTrader,
          brokerAddress,
          assetRegistry,
          stRSRAddress,
          shortFreeze,
          longFreeze,
        ] = await promiseMulticall(
          [
            {
              ...mainCall,
              method: 'distributor',
            },
            {
              ...mainCall,
              method: 'backingManager',
            },
            {
              ...mainCall,
              method: 'rTokenTrader',
            },
            {
              ...mainCall,
              method: 'broker',
            },
            {
              ...mainCall,
              method: 'assetRegistry',
            },
            {
              ...mainCall,
              method: 'stRSR',
            },
            {
              ...mainCall,
              method: 'shortFreeze',
            },
            {
              ...mainCall,
              method: 'longFreeze',
            },
          ],
          provider
        )

        const [
          tradingDelay,
          backingBuffer,
          maxTradeSlippage,
          minTradeVolume,
          rewardPeriod,
          rewardRatio,
          unstakingDelay,
          auctionLength,
          issuanceRate,
          scalingRedemptionRate,
          redemptionRateFloor,
          rTokenAsset,
        ] = await promiseMulticall(
          [
            {
              abi: BackingManagerInterface,
              address: backingManager,
              args: [],
              method: 'tradingDelay',
            },
            {
              abi: BackingManagerInterface,
              address: backingManager,
              args: [],
              method: 'backingBuffer',
            },
            {
              abi: RevenueTraderInterface,
              address: rTokenTrader,
              args: [],
              method: 'maxTradeSlippage',
            },
            {
              abi: RevenueTraderInterface,
              address: rTokenTrader,
              args: [],
              method: 'minTradeVolume',
            },
            {
              abi: StRSRInterface,
              address: stRSRAddress,
              args: [],
              method: 'rewardPeriod',
            },
            {
              abi: StRSRInterface,
              address: stRSRAddress,
              args: [],
              method: 'rewardRatio',
            },
            {
              abi: StRSRInterface,
              address: stRSRAddress,
              args: [],
              method: 'unstakingDelay',
            },
            {
              abi: BrokerInterface,
              address: brokerAddress,
              args: [],
              method: 'auctionLength',
            },
            {
              abi: RTokenInterface,
              address: rToken.address,
              args: [],
              method: 'issuanceRate',
            },
            {
              abi: RTokenInterface,
              address: rToken.address,
              args: [],
              method: 'scalingRedemptionRate',
            },
            {
              abi: RTokenInterface,
              address: rToken.address,
              args: [],
              method: 'redemptionRateFloor',
            },
            {
              abi: AssetRegistryInterface,
              address: assetRegistry,
              args: [rToken.address],
              method: 'toAsset',
            },
          ],
          provider
        )

        const rTokenAssetContract = getContract(
          rTokenAsset,
          AssetAbi,
          provider
        ) as Asset

        const maxTradeVolume = await rTokenAssetContract.maxTradeVolume()

        // Revenue distribution
        const contract = getContract(distribution, DistributorAbi, provider)
        const events = await contract.queryFilter(
          'DistributionSet(address,uint16,uint16)'
        )
        const dist: StringMap = { external: {}, holders: '', stakers: '' }
        const furnace = '0x0000000000000000000000000000000000000001'
        const stRSR = '0x0000000000000000000000000000000000000002'

        for (const event of events) {
          if (event.args) {
            const { dest, rTokenDist, rsrDist } = event.args

            // Dist removed
            if (!rTokenDist && !rsrDist) {
              delete dist[dest]
            } else if (dest === furnace) {
              dist.holders = shareToPercent(rTokenDist)
            } else if (dest === stRSR) {
              dist.stakers = shareToPercent(rsrDist)
            } else {
              const holders = shareToPercent(rTokenDist)
              const stakers = shareToPercent(rsrDist)

              dist.external[dest] = {
                holders,
                stakers,
                total: (+holders + +stakers).toString(),
                address: dest,
              }
            }
          }
        }

        setRevenueSplit({
          ...dist,
          external: Object.values(dist.external),
        } as RevenueSplit)
      } catch (e) {
        console.error(e)
      }
    }
  }, [rToken, provider])

  useEffect(() => {
    fetchParams()
  }, [fetchParams])

  return null
}

const useRTokenMeta = () => {
  const basketDist = useAtomValue(primaryBasketAtom)
  const setPrimaryBasket = useSetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)
  useTokenBackup()
  useRTokenParameters()

  useEffect(() => {
    setPrimaryBasket(basketDist || {})
  }, [basketDist])

  useEffect(() => {
    return () => {
      setPrimaryBasket({})
      resetBackup()
      resetRevenueSplit()
    }
  }, [])

  return null
}

export default useRTokenMeta
