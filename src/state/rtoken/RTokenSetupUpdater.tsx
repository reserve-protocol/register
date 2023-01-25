import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import {
  Asset as AssetAbi,
  AssetRegistryInterface,
  BackingManagerInterface,
  BrokerInterface,
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
import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  rTokenContractsAtom,
  rTokenParamsAtom,
  rTokenRevenueSplitAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { StringMap } from 'types'
import { getContract } from 'utils'

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
  const setRTokenContracts = useSetAtom(rTokenContractsAtom)

  const fetchParams = useCallback(
    async (
      rTokenAddress: string,
      mainAddress: string,
      provider: Web3Provider
    ) => {
      try {
        const mainCall = { abi: MainInterface, address: mainAddress, args: [] }
        // TODO: Fetch addresses and store it in an atom
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
          ],
          provider
        )

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
          issuanceThrottleAmount: formatEther(issuanceThrottle.amtRate),
          issuanceThrottleRate: (
            +formatEther(issuanceThrottle.pctRate) * 100
          ).toString(),
          redemptionThrottleAmount: formatEther(redemptionThrottle.amtRate),
          redemptionThrottleRate: (
            +formatEther(redemptionThrottle.pctRate) * 100
          ).toString(),
          maxTrade: formatEther(maxTradeVolume),
          longFreeze: longFreeze.toString(),
          shortFreeze: shortFreeze.toString(),
        })

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
              const total = +holders + +stakers

              dist.external[dest] = {
                holders: (+holders * 100) / total,
                stakers: (+stakers * 100) / total,
                total: total.toString(),
                address: dest,
              }
            }
          }
        }

        setRevenueSplit({
          ...dist,
          external: Object.values(dist.external),
        } as RevenueSplit)

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
        })
      } catch (e) {
        console.error('Error getting RToken Setup', e)
      }
    },
    []
  )

  useEffect(() => {
    if (rToken?.address && rToken?.main && provider) {
      fetchParams(rToken.address, rToken.main, provider)
    }
  }, [rToken?.address, provider])

  return null
}

export default RTokenSetupUpdater
