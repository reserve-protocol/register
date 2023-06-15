import {
  BackingManagerInterface,
  BrokerInterface,
  MainInterface,
  RTokenInterface,
  RevenueTraderInterface,
  StRSRInterface,
  _BrokerInterface,
} from 'abis'
import { formatEther } from 'ethers/lib/utils'
import { multicallAtom } from 'state/atoms'
import { StringMap } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { VERSION } from 'utils/constants'
import rTokenAssetsAtom from './rTokenAssetsAtom'
import rTokenContractsAtom from './rTokenContractsAtom'

const rTokenConfigurationAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const assets = get(rTokenAssetsAtom)
  const multicall = get(multicallAtom)

  if (!contracts || !multicall || !assets) {
    return null
  }

  const rTokenCall = {
    abi: RTokenInterface,
    address: contracts.token.address,
    args: [],
  }

  const stRSRCall = {
    abi: StRSRInterface,
    address: contracts.stRSR.address,
    args: [],
  }

  const mainCall = {
    abi: MainInterface,
    address: contracts.main.address,
    args: [],
  }

  const calls = [
    {
      ...mainCall,
      method: 'shortFreeze',
    },
    {
      ...mainCall,
      method: 'longFreeze',
    },
    {
      abi: BackingManagerInterface,
      address: contracts.backingManager.address,
      args: [],
      method: 'tradingDelay',
    },
    {
      abi: BackingManagerInterface,
      address: contracts.backingManager.address,
      args: [],
      method: 'backingBuffer',
    },
    {
      abi: RevenueTraderInterface,
      address: contracts.rTokenTrader.address,
      args: [],
      method: 'maxTradeSlippage',
    },
    {
      abi: RevenueTraderInterface,
      address: contracts.rTokenTrader.address,
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
      ...rTokenCall,
      method: 'issuanceThrottleParams',
    },
    {
      ...rTokenCall,
      method: 'redemptionThrottleParams',
    },
  ]

  // TODO: Legacy check
  if (contracts.broker.version !== VERSION) {
    calls.push({
      abi: _BrokerInterface,
      address: contracts.broker.address,
      args: [],
      method: 'auctionLength',
    })
  } else {
    calls.push(
      {
        abi: BrokerInterface,
        address: contracts.broker.address,
        args: [],
        method: 'batchAuctionLength',
      },
      {
        abi: BrokerInterface,
        address: contracts.broker.address,
        args: [],
        method: 'dutchAuctionLength',
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
  ] = await multicall(calls)

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
