import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import {
  isModuleLegacyAtom,
  rTokenContractsAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { BackupChanges, CollateralChange } from './hooks/useBackupChanges'
import { ParameterChange } from './hooks/useParametersChanges'
import { RevenueSplitChanges } from './hooks/useRevenueSplitChanges'
import { RoleChange } from './hooks/useRoleChanges'
import BackingManager from 'abis/BackingManager'
import RevenueTrader from 'abis/RevenueTrader'
import Furnace from 'abis/Furnace'
import StRSR from 'abis/StRSR'
import RToken from 'abis/RToken'
import Broker from 'abis/Broker'
import Main from 'abis/Main'
import BrokerLegacy from 'abis/BrokerLegacy'
import BasketHandler from 'abis/BasketHandler'
import { RegisterAsset } from './hooks/useRegisterAssets'
import { Address } from 'viem'
import Governance from 'abis/Governance'
import Timelock from 'abis/Timelock'

export const proposalTxIdAtom = atom('')

export const isNewBasketProposedAtom = atom(false)
export const autoRegisterBasketAssetsAtom = atom(true)
export const isNewBackupProposedAtom = atom(false)
export const autoRegisterBackupAssetsAtom = atom(true)

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

export const contractUpgradesAtom = atomWithReset<Record<string, Address>>({})

export const unregisterAssetsAtom = atomWithReset<string[]>([])

export const registerAssetsAtom = atomWithReset<RegisterAsset[]>([])
export const registerAssetsProposedAtom = atomWithReset<string[]>([])

export const backupChangesAtom = atomWithReset<BackupChanges>({
  collateralChanges: [],
  priorityChanges: [],
  diversityFactor: [],
  count: 0,
})

export const basketChangesAtom = atomWithReset<CollateralChange[]>([])

export const isAssistedUpgradeAtom = atom(false)
export const isProposalValidAtom = atom(false)
export const isProposalEditingAtom = atom(true)
export const proposalDescriptionAtom = atom('')

export type ParamName =
  | 'tradingDelay'
  | 'withdrawalLeak'
  | 'backingBuffer'
  | 'maxTradeSlippage'
  | 'minTrade'
  | 'rewardRatio'
  | 'unstakingDelay'
  | 'batchAuctionLength'
  | 'dutchAuctionLength'
  | 'warmupPeriod'
  | 'issuanceThrottle'
  | 'redemptionThrottle'
  | 'shortFreeze'
  | 'longFreeze'
  | 'batchTradeImplementation'
  | 'dutchTradeImplementation'
  | 'votingDelay'
  | 'votingPeriod'
  | 'minDelay'
  | 'proposalThresholdAsMicroPercent'
  | 'quorumPercent'

export const parameterContractMapAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)
  const governance = get(rTokenGovernanceAtom)
  const legacy = get(isModuleLegacyAtom)

  return {
    tradingDelay: [
      {
        address: contracts?.backingManager.address ?? '',
        functionName: 'setTradingDelay' as const, // setTradingDelay(uint48)
        abi: BackingManager,
      },
    ],
    backingBuffer: [
      {
        address: contracts?.backingManager.address ?? '',
        functionName: 'setBackingBuffer' as const, // setBackingBuffer(uint192)
        abi: BackingManager,
      },
    ],
    maxTradeSlippage: [
      {
        address: contracts?.backingManager.address ?? '',
        functionName: 'setMaxTradeSlippage' as const, // setMaxTradeSlippage(uint192)
        abi: BackingManager,
      },
      {
        address: contracts?.rTokenTrader.address ?? '',
        functionName: 'setMaxTradeSlippage' as const, // setMaxTradeSlippage(uint192)
        abi: RevenueTrader,
      },
      {
        address: contracts?.rsrTrader.address ?? '',
        functionName: 'setMaxTradeSlippage' as const, // setMaxTradeSlippage(uint192)
        abi: RevenueTrader,
      },
    ],
    minTrade: [
      {
        address: contracts?.backingManager.address ?? '',
        functionName: 'setMinTradeVolume' as const, // setMinTradeVolume(uint192)
        abi: BackingManager,
      },
      {
        address: contracts?.rTokenTrader.address ?? '',
        functionName: 'setMinTradeVolume' as const, // setMinTradeVolume(uint192)
        abi: RevenueTrader,
      },
      {
        address: contracts?.rsrTrader.address ?? '',
        functionName: 'setMinTradeVolume' as const, // setMinTradeVolume(uint192)
        abi: RevenueTrader,
      },
    ],
    rewardRatio: [
      {
        address: contracts?.furnace.address ?? '',
        functionName: 'setRatio' as const, // setRatio(uint192)
        abi: Furnace,
      },
      {
        address: contracts?.stRSR.address ?? '',
        functionName: 'setRewardRatio' as const, // setRewardRatio(uint192)
        abi: StRSR,
      },
    ],
    unstakingDelay: [
      {
        address: contracts?.stRSR.address ?? '',
        functionName: 'setUnstakingDelay' as const, // setUnstakingDelay(uint48)
        abi: StRSR,
      },
    ],
    withdrawalLeak: [
      {
        address: contracts?.stRSR.address ?? '',
        functionName: 'setWithdrawalLeak' as const,
        abi: StRSR,
      },
    ],
    warmupPeriod: [
      {
        address: contracts?.basketHandler.address ?? '',
        functionName: 'setWarmupPeriod',
        abi: BasketHandler,
      },
    ],
    batchAuctionLength: [
      {
        address: contracts?.broker.address ?? '',
        functionName: legacy.auctions
          ? 'setAuctionLength'
          : 'setBatchAuctionLength', // setAuctionLength(uint48)
        abi: legacy.auctions ? BrokerLegacy : Broker,
      },
    ],
    dutchAuctionLength: [
      {
        address: contracts?.broker.address ?? '',
        functionName: 'setDutchAuctionLength',
        abi: Broker,
      },
    ],
    batchTradeImplementation: [
      {
        address: contracts?.broker.address ?? '',
        functionName: 'setBatchTradeImplementation',
        abi: Broker,
      },
    ],
    dutchTradeImplementation: [
      {
        address: contracts?.broker.address ?? '',
        functionName: 'setDutchTradeImplementation',
        abi: Broker,
      },
    ],
    issuanceThrottle: [
      {
        address: contracts?.token.address ?? '',
        functionName: 'setIssuanceThrottleParams' as const, // setIssuanceThrottleParams((uint256,uint192))
        abi: RToken,
      },
    ],
    redemptionThrottle: [
      {
        address: contracts?.token.address ?? '',
        functionName: 'setRedemptionThrottleParams' as const, // setRedemptionThrottleParams((uint256,uint192))
        abi: RToken,
      },
    ],
    shortFreeze: [
      {
        address: contracts?.main.address ?? '',
        functionName: 'setShortFreeze' as const, // setShortFreeze(uint48)
        abi: Main,
      },
    ],
    longFreeze: [
      {
        address: contracts?.main.address ?? '',
        functionName: 'setLongFreeze' as const, // setLongFreeze(uint48)
        abi: Main,
      },
    ],
    votingDelay: [
      {
        address: governance.governor ?? '',
        functionName: 'setVotingDelay' as const, // setVotingDelay(uint48)
        abi: Governance,
      },
    ],
    votingPeriod: [
      {
        address: governance.governor ?? '',
        functionName: 'setVotingPeriod' as const, // setVotingDelay(uint48)
        abi: Governance,
      },
    ],
    minDelay: [
      {
        address: governance.timelock ?? '',
        functionName: 'updateDelay' as const, // updateDelay(uint48)
        abi: Timelock,
      },
    ],
  }
})
