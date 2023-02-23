import {
  AssetRegistryInterface,
  BackingManagerInterface,
  BasketHandlerInterface,
  BrokerInterface,
  DistributorInterface,
  FurnaceInterface,
  GovernanceInterface,
  MainInterface,
  RevenueTraderInterface,
  StRSRInterface,
  TimelockInterface,
} from 'abis'
import { Interface } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { rTokenContractsAtom, rTokenGovernanceAtom } from 'state/atoms'

export interface ProposalCall {
  signature: string
  parameters: string[]
  callData: string
  data: any
}

export type InterfaceMap = {
  [x: string]: { interface: Interface; label: string }
}

export interface ContractProposal {
  address: string
  label: string
  calls: ProposalCall[]
}

export const contractDetails: InterfaceMap = {
  main: { interface: MainInterface, label: 'Main' },
  backingManager: {
    interface: BackingManagerInterface,
    label: 'BackingManager',
  },
  rTokenTrader: {
    interface: RevenueTraderInterface,
    label: 'RTokenTrader',
  },
  rsrTrader: {
    interface: RevenueTraderInterface,
    label: 'RSRTrader',
  },
  broker: {
    interface: BrokerInterface,
    label: 'Broker',
  },
  assetRegistry: {
    interface: AssetRegistryInterface,
    label: 'AssetRegistry',
  },
  stRSR: {
    interface: StRSRInterface,
    label: 'StRSR',
  },
  furnace: {
    interface: FurnaceInterface,
    label: 'Furnace',
  },
  distributor: {
    interface: DistributorInterface,
    label: 'Distributor',
  },
  basketHandler: {
    interface: BasketHandlerInterface,
    label: 'BasketHandler',
  },
  governor: {
    interface: GovernanceInterface,
    label: 'Governance',
  },
  timelock: {
    interface: TimelockInterface,
    label: 'Timelock',
  },
}

export const interfaceMapAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)
  const governance = get(rTokenGovernanceAtom)

  const map = Object.keys(contractDetails).reduce((prev, curr) => {
    if (contracts[curr]) {
      prev[contracts[curr]] = contractDetails[curr]
    }
    return prev
  }, {} as InterfaceMap)
  map[governance.governor] = contractDetails.governor

  if (governance.timelock) {
    map[governance.timelock] = contractDetails.timelock
  }

  return map
})
