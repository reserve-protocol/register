import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import {
  Asset as AssetAbi,
  AssetRegistryInterface,
  BackingManagerInterface,
  BrokerInterface,
  CollateralInterface,
  Distributor as DistributorAbi,
  MainInterface,
  RevenueTraderInterface,
  RTokenInterface,
  StRSRInterface,
} from 'abis'
import { Asset } from 'abis/types'
import { RevenueSplit } from 'components/rtoken-setup/atoms'
import { formatEther } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  rTokenCollateralAssetsAtom,
  rTokenContractsAtom,
  rTokenParamsAtom,
  rTokenRevenueSplitAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall, StringMap } from 'types'
import { getContract } from 'utils'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'

const shareToPercent = (shares: number): string => {
  return Math.floor((shares * 100) / 10000).toString()
}

/**
 * Fetchs RToken setup parameters, only updated through governance
 *
 * ? Fetch only when rToken changes
 */
const RTokenSetupUpdater = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const setRevenueSplit = useSetAtom(rTokenRevenueSplitAtom)
  const setRTokenParams = useSetAtom(rTokenParamsAtom)
  const setCollateralAssets = useSetAtom(rTokenCollateralAssetsAtom)
  const [contracts, setRTokenContracts] = useAtom(rTokenContractsAtom)

  const fetchParams = useCallback(
    async (
      rTokenAddress: string,
      mainAddress: string,
      provider: Web3Provider
    ) => {
      try {
        const mainCall = { abi: MainInterface, address: mainAddress, args: [] }
        const [
          distribution,
          backingManager,
          rTokenTrader,
          rsrTrader,
          furnaceAddress,
          brokerAddress,
          assetRegistry,
          stRSRAddress,
          shortFreeze,
          longFreeze,
          basketHandler,
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
              method: 'rsrTrader',
            },
            {
              ...mainCall,
              method: 'furnace',
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
            {
              ...mainCall,
              method: 'basketHandler',
            },
          ],
          provider
        )

        // Revenue distribution
        const contract = getContract(distribution, DistributorAbi, provider)
        const events = await contract.queryFilter(
          'DistributionSet(address,uint16,uint16)'
        )
        const dist: StringMap = { external: {}, holders: '', stakers: '' }

        for (const event of events) {
          if (event.args) {
            const { dest, rTokenDist, rsrDist } = event.args

            // Dist removed
            if (!rTokenDist && !rsrDist) {
              delete dist[dest]
            } else if (dest === FURNACE_ADDRESS) {
              dist.holders = shareToPercent(rTokenDist) || '0'
            } else if (dest === ST_RSR_ADDRESS) {
              dist.stakers = shareToPercent(rsrDist) || '0'
            } else {
              const holders = shareToPercent(rTokenDist)
              const stakers = shareToPercent(rsrDist)
              const total = +holders + +stakers

              dist.external[dest] = {
                holders: ((+holders * 100) / total).toString() || '0',
                stakers: ((+stakers * 100) / total).toString() || '0',
                total: total.toString(),
                address: dest,
              }
            }
          }
        }

        console.log('distribution', dist)

        setRevenueSplit({
          ...dist,
          external: Object.values(dist.external),
        } as RevenueSplit)

        const rTokenCall = {
          abi: RTokenInterface,
          address: rTokenAddress,
          args: [],
        }

        const stRSRCall = {
          abi: StRSRInterface,
          address: stRSRAddress,
          args: [],
        }

        const [
          tradingDelay,
          backingBuffer,
          maxTradeSlippage,
          minTradeVolume,
          rewardRatio,
          unstakingDelay,
          auctionLength,
          issuanceThrottle,
          redemptionThrottle,
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
              ...stRSRCall,
              method: 'rewardRatio',
            },
            {
              ...stRSRCall,
              method: 'unstakingDelay',
            },
            {
              abi: BrokerInterface,
              address: brokerAddress,
              args: [],
              method: 'auctionLength',
            },
            {
              ...rTokenCall,
              method: 'issuanceThrottleParams',
            },
            {
              ...rTokenCall,
              method: 'redemptionThrottleParams',
            },
            {
              abi: AssetRegistryInterface,
              address: assetRegistry,
              args: [rTokenAddress],
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

        setRTokenParams({
          tradingDelay: tradingDelay.toString(),
          backingBuffer: (+formatEther(backingBuffer) * 100).toString(),
          maxTradeSlippage: (+formatEther(maxTradeSlippage) * 100).toString(),
          minTrade: formatEther(minTradeVolume),
          rewardRatio: formatEther(rewardRatio),
          unstakingDelay: unstakingDelay.toString(),
          auctionLength: auctionLength.toString(),
          issuanceThrottleAmount: Number(
            formatEther(issuanceThrottle.amtRate)
          ).toString(),
          issuanceThrottleRate: (
            +formatEther(issuanceThrottle.pctRate) * 100
          ).toString(),
          redemptionThrottleAmount: Number(
            formatEther(redemptionThrottle.amtRate)
          ).toString(),
          redemptionThrottleRate: (
            +formatEther(redemptionThrottle.pctRate) * 100
          ).toString(),
          maxTrade: Number(formatEther(maxTradeVolume)).toString(),
          longFreeze: longFreeze.toString(),
          shortFreeze: shortFreeze.toString(),
        })

        // RToken contracts update
        setRTokenContracts({
          main: mainAddress,
          backingManager,
          distributor: distribution,
          rTokenTrader,
          rsrTrader,
          broker: brokerAddress,
          assetRegistry,
          stRSR: stRSRAddress,
          furnace: furnaceAddress,
          rTokenAsset,
          basketHandler,
        })
      } catch (e) {
        console.error('Error getting RToken Setup', e)
      }
    },
    []
  )

  // TODO: move to the same multicall where the collaterals are fetched
  const fetchBasketAssets = async () => {
    if (rToken && provider && contracts.assetRegistry && !rToken.isRSV) {
      try {
        const assets = await promiseMulticall(
          rToken.collaterals.map((c) => ({
            address: contracts.assetRegistry,
            abi: AssetRegistryInterface,
            method: 'toAsset',
            args: [c.address],
          })),
          provider
        )

        setCollateralAssets(assets)

        // TODO: Optimize code using reduce function, prioritize clarity atm
        const calls: ContractCall[] = []

        for (const asset of assets) {
          calls.push({
            address: asset,
            abi: CollateralInterface,
            method: 'delayUntilDefault',
            args: [],
          })
          calls.push({
            address: asset,
            abi: CollateralInterface,
            method: 'delayUntilDefault',
            args: [],
          })
        }

        // const assetInfo = await promiseMulticall(assets.map(address => ) )
      } catch (e) {
        console.error('Error fetching basket assets', e)
      }
    }
  }

  useEffect(() => {
    if (rToken?.main && provider) {
      fetchParams(rToken.address, rToken.main, provider)
    }
  }, [rToken?.main, provider])

  useEffect(() => {
    fetchBasketAssets()
  }, [contracts?.assetRegistry, provider])

  return null
}

export default RTokenSetupUpdater
