import {
  BackingManagerInterface,
  BrokerInterface,
  FurnaceInterface,
  MainInterface,
  RevenueTraderInterface,
  RTokenInterface,
  StRSRInterface,
} from 'abis'
import { Interface } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { rTokenContractsAtom } from 'state/atoms'
import { BackupChanges, CollateralChange } from './hooks/useBackupChanges'
import { ParameterChange } from './hooks/useParametersChanges'
import { RevenueSplitChanges } from './hooks/useRevenueSplitChanges'
import { RoleChange } from './hooks/useRoleChanges'

export const proposalTxIdAtom = atom('')

export const isNewBasketProposedAtom = atom(false)
export const isNewBackupProposedAtom = atom(false)

export const proposedRolesAtom = atomWithReset({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
  guardians: [] as string[],
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

export const basketChangesAtom = atomWithReset<CollateralChange[]>([])

export const isProposalValidAtom = atom(false)
export const isProposalEditingAtom = atom(true)
export const proposalDescriptionAtom = atom('')

export const parameterContractMapAtom = atom<{
  [x: string]: { address: string; method: string; interface: Interface }[]
}>((get) => {
  const contracts = get(rTokenContractsAtom)

  return {
    tradingDelay: [
      {
        address: contracts?.backingManager.address ?? '',
        method: 'setTradingDelay', // setTradingDelay(uint48)
        interface: BackingManagerInterface,
      },
    ],
    backingBuffer: [
      {
        address: contracts?.backingManager.address ?? '',
        method: 'setBackingBuffer', // setBackingBuffer(uint192)
        interface: BackingManagerInterface,
      },
    ],
    maxTradeSlippage: [
      {
        address: contracts?.backingManager.address ?? '',
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: BackingManagerInterface,
      },
      {
        address: contracts?.rTokenTrader.address ?? '',
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: RevenueTraderInterface,
      },
      {
        address: contracts?.rsrTrader.address ?? '',
        method: 'setMaxTradeSlippage', // setMaxTradeSlippage(uint192)
        interface: RevenueTraderInterface,
      },
    ],
    minTrade: [
      {
        address: contracts?.backingManager.address ?? '',
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: BackingManagerInterface,
      },
      {
        address: contracts?.rTokenTrader.address ?? '',
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: RevenueTraderInterface,
      },
      {
        address: contracts?.rsrTrader.address ?? '',
        method: 'setMinTradeVolume', // setMinTradeVolume(uint192)
        interface: RevenueTraderInterface,
      },
    ],
    rewardRatio: [
      {
        address: contracts?.furnace.address ?? '',
        method: 'setRatio', // setRatio(uint192)
        interface: FurnaceInterface,
      },
      {
        address: contracts?.stRSR.address ?? '',
        method: 'setRewardRatio', // setRewardRatio(uint192)
        interface: StRSRInterface,
      },
    ],
    unstakingDelay: [
      {
        address: contracts?.stRSR.address ?? '',
        method: 'setUnstakingDelay', // setUnstakingDelay(uint48)
        interface: StRSRInterface,
      },
    ],
    auctionLength: [
      {
        address: contracts?.broker.address ?? '',
        method: 'setAuctionLength', // setAuctionLength(uint48)
        interface: BrokerInterface,
      },
    ],
    issuanceThrottle: [
      {
        address: contracts?.token.address ?? '',
        method: 'setIssuanceThrottleParams', // setIssuanceThrottleParams((uint256,uint192))
        interface: RTokenInterface,
      },
    ],
    redemptionThrottle: [
      {
        address: contracts?.token.address ?? '',
        method: 'setRedemptionThrottleParams', // setRedemptionThrottleParams((uint256,uint192))
        interface: RTokenInterface,
      },
    ],
    shortFreeze: [
      {
        address: contracts?.main.address ?? '',
        method: 'setShortFreeze', // setShortFreeze(uint48)
        interface: MainInterface,
      },
    ],
    longFreeze: [
      {
        address: contracts?.main.address ?? '',
        method: 'setLongFreeze', // setLongFreeze(uint48)
        interface: MainInterface,
      },
    ],
  }
})
