import BackingManager from 'abis/BackingManager'
import Broker from 'abis/Broker'
import BrokerLegacy from 'abis/BrokerLegacy'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import RevenueTrader from 'abis/RevenueTrader'
import StRSR from 'abis/StRSR'
import { StringMap } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { VERSION } from 'utils/constants'
import { readContracts } from 'wagmi'
import rTokenAssetsAtom from './rTokenAssetsAtom'
import rTokenContractsAtom from './rTokenContractsAtom'
import { formatEther } from 'viem'

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

  const calls: any[] = [
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
  ]

  // TODO: Legacy check
  if (contracts.broker.version !== VERSION) {
    calls.push({
      abi: BrokerLegacy,
      address: contracts.broker.address,
      functionName: 'auctionLength',
    })
  } else {
    calls.push(
      {
        ...brokerCall,
        functionName: 'batchAuctionLength',
      },
      {
        ...brokerCall,
        functionName: 'dutchAuctionLength',
      }
    )
  }

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
    batchAuctionLength,
    dutchAuctionLength,
  ] = await (<
    Promise<
      [
        number,
        number,
        number,
        bigint,
        bigint,
        bigint,
        bigint,
        number,
        { amtRate: bigint; pctRate: bigint },
        { amtRate: bigint; pctRate: bigint },
        number,
        number | undefined
      ]
    >
  >readContracts({ contracts: calls, allowFailure: false }))

  return {
    tradingDelay: tradingDelay.toString(),
    backingBuffer: (+formatEther(backingBuffer) * 100).toString(),
    maxTradeSlippage: (+formatEther(maxTradeSlippage) * 100).toString(),
    minTrade: formatEther(minTradeVolume),
    rewardRatio: formatEther(rewardRatio),
    unstakingDelay: unstakingDelay.toString(),
    batchAuctionLength: batchAuctionLength.toString(),
    dutchAuctionLength: dutchAuctionLength?.toString() || '0',
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
    maxTrade: assets[contracts.token.address]?.maxTradeVolume ?? '0',
    longFreeze: longFreeze.toString(),
    shortFreeze: shortFreeze.toString(),
  } as StringMap
})

export default rTokenConfigurationAtom
