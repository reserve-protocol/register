import { atomWithReset } from 'jotai/utils'
import { atom } from 'jotai'
import { BackupChanges } from './hooks/useBackupChanges'
import { RoleChange } from './hooks/useRoleChanges'
import { ParameterChange } from './hooks/useParametersChanges'
import { RevenueSplitChanges } from './hooks/useRevenueSplitChanges'
import {
  BackingManagerInterface,
  BrokerInterface,
  FurnaceInterface,
  MainInterface,
  RevenueTraderInterface,
  RTokenInterface,
  StRSRInterface,
  AssetInterface,
} from 'abis'
import { rTokenAtom, rTokenContractsAtom } from 'state/atoms'
import { Interface } from 'ethers/lib/utils'

export const isNewBasketProposedAtom = atom(false)

export const proposedRolesAtom = atomWithReset({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
})

export const revenueSplitChangesAtom = atomWithReset<RevenueSplitChanges>({
  externals: [],
  distributions: [],
  count: 0,
})

export const parametersChangesAtom = atomWithReset<ParameterChange[]>([])

export const roleChangesAtom = atomWithReset<RoleChange[]>([])

export const backupChangesAtom = atomWithReset<BackupChanges>({
  collateralChanges: [],
  priorityChanges: [],
  diversityFactor: [],
  count: 0,
})

export const isProposalValidAtom = atom(false)
export const isProposalEditingAtom = atom(true)
export const proposalDescriptionAtom = atom('')

export const parameterContractMapAtom = atom<{
  [x: string]: { address: string; method: string; interface: Interface }[]
}>((get) => {
  const contracts = get(rTokenContractsAtom)
  const rToken = get(rTokenAtom)

  return {
    tradingDelay: [
      {
        address: contracts.backingManager,
        method: 'setTradingDelay', // setTradingDelay(uint48)
        interface: BackingManagerInterface,
      },
    ],
    backingBuffer: [
      {
        address: contracts.backingManager,
        method: 'setBackingBuffer', // setBackingBuffer(uint192)
        interface: BackingManagerInterface,
      },
    ],
    maxTradeSlippage: [
      {
        address: contracts.backingManager,
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: BackingManagerInterface,
      },
      {
        address: contracts.rTokenTrader,
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: RevenueTraderInterface,
      },
      {
        address: contracts.rsrTrader,
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: RevenueTraderInterface,
      },
    ],
    minTrade: [
      {
        address: contracts.backingManager,
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: BackingManagerInterface,
      },
      {
        address: contracts.rTokenTrader,
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: RevenueTraderInterface,
      },
      {
        address: contracts.rsrTrader,
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: RevenueTraderInterface,
      },
    ],
    rewardRatio: [
      {
        address: contracts.furnace,
        method: 'setRatio', // setRatio(uint192)
        interface: FurnaceInterface,
      },
      {
        address: contracts.stRSR,
        method: 'setRewardRatio', // setRewardRatio(uint192)
        interface: StRSRInterface,
      },
    ],
    unstakingDelay: [
      {
        address: contracts.stRSR,
        method: 'setUnstakingDelay', // setUnstakingDelay(uint48)
        interface: StRSRInterface,
      },
    ],
    auctionLength: [
      {
        address: contracts.broker,
        method: 'setAuctionLength', // setAuctionLength(uint48)
        interface: BrokerInterface,
      },
    ],
    issuanceThrottle: [
      {
        address: rToken?.address ?? '',
        method: 'setIssuanceThrottleParams', // setIssuanceThrottleParams((uint256,uint192))
        interface: RTokenInterface,
      },
    ],
    redemptionThrottle: [
      {
        address: rToken?.address ?? '',
        method: 'setRedemptionThrottleParams', // setRedemptionThrottleParams((uint256,uint192))
        interface: RTokenInterface,
      },
    ],
    shortFreeze: [
      {
        address: rToken?.main ?? '',
        method: 'setShortFreeze', // setShortFreeze(uint48)
        interface: MainInterface,
      },
    ],
    longFreeze: [
      {
        address: rToken?.main ?? '',
        method: 'setLongFreeze', // setLongFreeze(uint48)
        interface: MainInterface,
      },
    ],
  }
})
