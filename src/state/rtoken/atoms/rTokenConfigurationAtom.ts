import BackingManager from 'abis/BackingManager'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import BrokerLegacy from 'abis/BrokerLegacy'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import RevenueTrader from 'abis/RevenueTrader'
import StRSR from 'abis/StRSR'
import { StringMap } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { formatEther } from 'viem'
import { readContracts } from 'wagmi'
import rTokenAssetsAtom from './rTokenAssetsAtom'
import rTokenContractsAtom from './rTokenContractsAtom'

const rTokenConfigurationAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const assets = get(rTokenAssetsAtom)

  if (!contracts || !assets) {
    return null
  }

  const rTokenCall = {
    abi: RToken,
    address: contracts.token.address,
  }

  const stRSRCall = {
    abi: StRSR,
    address: contracts.stRSR.address,
  }

  const mainCall = {
    abi: Main,
    address: contracts.main.address,
  }

  const traderCall = {
    abi: RevenueTrader,
    address: contracts.rTokenTrader.address,
  }

  const backingManagerCall = {
    abi: BackingManager,
    address: contracts.backingManager.address,
  }

  const brokerCall = {
    abi: Broker,
    address: contracts.broker.address,
  }

  const calls = [
    {
      ...mainCall,
      functionName: 'shortFreeze',
    },
    {
      ...mainCall,
      functionName: 'longFreeze',
    },
    {
      ...backingManagerCall,
      functionName: 'tradingDelay',
    },
    {
      ...backingManagerCall,
      functionName: 'backingBuffer',
    },
    {
      ...traderCall,
      functionName: 'maxTradeSlippage',
    },
    {
      ...traderCall,
      functionName: 'minTradeVolume',
    },
    {
      ...stRSRCall,
      functionName: 'rewardRatio',
    },
    {
      ...stRSRCall,
      functionName: 'unstakingDelay',
    },
    {
      ...rTokenCall,
      functionName: 'issuanceThrottleParams',
    },
    {
      ...rTokenCall,
      functionName: 'redemptionThrottleParams',
    },
    // Legacy call - could fail
    {
      abi: BrokerLegacy,
      address: contracts.broker.address,
      functionName: 'auctionLength',
    },
    // New 3.0 calls, revert on legacy tokens
    {
      ...brokerCall,
      functionName: 'batchAuctionLength',
    },
    {
      ...brokerCall,
      functionName: 'dutchAuctionLength',
    },
    {
      abi: BasketHandler,
      address: contracts.basketHandler.address,
      functionName: 'warmupPeriod',
    },
    {
      ...stRSRCall,
      functionName: 'withdrawalLeak',
    },
  ]

  try {
    const [
      shortFreeze,
      longFreeze,
      tradingDelay,
      backingBuffer,
      maxTradeSlippage,
      minTradeVolume,
      rewardRatio,
      unstakingDelay,
      issuanceThrottle,
      redemptionThrottle,
      legacyAuctionLength,
      batchAuctionLength,
      dutchAuctionLength,
      warmupPeriod,
      withdrawalLeak,
    ] = await readContracts({ contracts: calls })

    return {
      tradingDelay: (tradingDelay.result as number).toString(),
      backingBuffer: (
        +formatEther(backingBuffer.result as bigint) * 100
      ).toString(),
      maxTradeSlippage: (
        +formatEther(maxTradeSlippage.result as bigint) * 100
      ).toString(),
      minTrade: formatEther(minTradeVolume.result as bigint),
      rewardRatio: formatEther(rewardRatio.result as bigint),
      unstakingDelay: (unstakingDelay.result as number).toString(),
      batchAuctionLength:
        batchAuctionLength.status === 'success'
          ? (batchAuctionLength.result as number).toString()
          : (legacyAuctionLength.result as number).toString(),
      dutchAuctionLength:
        dutchAuctionLength.status === 'success'
          ? (dutchAuctionLength.result as number).toString()
          : '0',
      issuanceThrottleAmount: Number(
        formatEther((issuanceThrottle.result as any).amtRate)
      ).toString(),
      issuanceThrottleRate: (
        +formatEther((issuanceThrottle.result as any).pctRate) * 100
      ).toString(),
      redemptionThrottleAmount: Number(
        formatEther((redemptionThrottle.result as any).amtRate)
      ).toString(),
      redemptionThrottleRate: (
        +formatEther((redemptionThrottle.result as any).pctRate) * 100
      ).toString(),
      maxTrade: assets[contracts.token.address]?.maxTradeVolume ?? '0',
      longFreeze: (longFreeze.result as number).toString(),
      shortFreeze: (shortFreeze.result as number).toString(),
      warmupPeriod:
        warmupPeriod.status === 'success'
          ? (warmupPeriod.result as number).toString()
          : '0',
      withdrawalLeak:
        withdrawalLeak.status === 'success'
          ? (+formatEther(withdrawalLeak.result as bigint) * 100).toString()
          : '0',
    } as StringMap
  } catch (e) {
    console.error('error fetching parameters', e)
  }
})

export default rTokenConfigurationAtom
