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
  RTokenInterface,
  StRSRInterface,
  TimelockInterface,
} from 'abis'
import { getAddress, Interface } from 'ethers/lib/utils'
import { atom } from 'jotai'
import {
  rTokenAtom,
  rTokenContractsAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'

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
  rToken: {
    interface: RTokenInterface,
    label: 'RToken',
  },
}

export const interfaceMapAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)
  const governance = get(rTokenGovernanceAtom)
  const rToken = get(rTokenAtom)

  if (!contracts) {
    return {}
  }

  const map = Object.keys(contractDetails).reduce((prev, curr) => {
    if (contracts[curr]) {
      prev[contracts[curr].address] = contractDetails[curr]
    }
    return prev
  }, {} as InterfaceMap)

  if (governance.timelock) {
    map[getAddress(governance.governor)] = contractDetails.governor
    map[getAddress(governance.timelock)] = contractDetails.timelock
  }

  if (rToken) {
    map[rToken.address] = contractDetails.rToken
  }

  return map
})
