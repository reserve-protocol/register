import {
  AssetRegistryInterface,
  BackingManagerInterface,
  BasketHandlerInterface,
  BrokerInterface,
  DistributorInterface,
  FurnaceInterface,
  MainInterface,
  RevenueTraderInterface,
  StRSRInterface,
} from 'abis'
import { Interface } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { rTokenContractsAtom } from 'state/atoms'

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
}

export const interfaceMapAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)
  return Object.keys(contractDetails).reduce((prev, curr) => {
    if (contracts[curr]) {
      prev[contracts[curr]] = contractDetails[curr]
    }
    return prev
  }, {} as InterfaceMap)
})
