import AssetRegistry from 'abis/AssetRegistry'
import BackingManager from 'abis/BackingManager'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import Distributor from 'abis/Distributor'
import Furnace from 'abis/Furnace'
import Governance from 'abis/Governance'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import RevenueTrader from 'abis/RevenueTrader'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import { atom } from 'jotai'
import {
  rTokenAtom,
  rTokenContractsAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { ContractKey } from 'state/rtoken/atoms/rTokenContractsAtom'
import { Abi, getAddress } from 'viem'

export interface ProposalCall {
  signature: string
  parameters: string[]
  callData: string
  data: any
}

export type InterfaceMap = {
  [x: string]: { interface: Abi; label: string }
}

export interface ContractProposal {
  address: string
  label: string
  calls: ProposalCall[]
}

export const contractDetails: InterfaceMap = {
  main: { interface: Main, label: 'Main' },
  backingManager: {
    interface: BackingManager,
    label: 'BackingManager',
  },
  rTokenTrader: {
    interface: RevenueTrader,
    label: 'RTokenTrader',
  },
  rsrTrader: {
    interface: RevenueTrader,
    label: 'RSRTrader',
  },
  broker: {
    interface: Broker,
    label: 'Broker',
  },
  assetRegistry: {
    interface: AssetRegistry,
    label: 'AssetRegistry',
  },
  stRSR: {
    interface: StRSR,
    label: 'StRSR',
  },
  furnace: {
    interface: Furnace,
    label: 'Furnace',
  },
  distributor: {
    interface: Distributor,
    label: 'Distributor',
  },
  basketHandler: {
    interface: BasketHandler,
    label: 'BasketHandler',
  },
  governor: {
    interface: Governance,
    label: 'Governance',
  },
  timelock: {
    interface: Timelock,
    label: 'Timelock',
  },
  rToken: {
    interface: RToken,
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
    if (contracts[curr as ContractKey]) {
      prev[contracts[curr as ContractKey].address] = contractDetails[curr]
    }
    return prev
  }, {} as InterfaceMap)

  if (governance.timelock && governance.governor) {
    map[getAddress(governance.governor)] = contractDetails.governor
    map[getAddress(governance.timelock)] = contractDetails.timelock
  }

  if (rToken) {
    map[rToken.address] = contractDetails.rToken
  }

  return map
})
