import { parseEther, toFunctionSelector } from 'viem'
import type { Address, Hex } from 'viem'

export const OPTIMISTIC_PROPOSER_ROLE =
  '0x26f49d08685d9cdd4951a7470bc8fbe9dd0f00419c1a44c1b89f845867ae12e0' as const

export const DEFAULT_OPTIMISTIC_VETO_DELAY = 43_200
export const DEFAULT_OPTIMISTIC_VETO_PERIOD = 129_600
export const DEFAULT_OPTIMISTIC_VETO_THRESHOLD = 2

export const dtfIndexGovernanceOptimisticAbi = [
  {
    type: 'function',
    name: 'setOptimisticParams',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'vetoDelay', type: 'uint48' },
          { name: 'vetoPeriod', type: 'uint32' },
          { name: 'vetoThreshold', type: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const selectorRegistryAbi = [
  {
    type: 'function',
    name: 'isAllowed',
    inputs: [
      { name: 'target', type: 'address' },
      { name: 'selector', type: 'bytes4' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerSelectors',
    inputs: [
      {
        name: 'selectorData',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'selectors', type: 'bytes4[]' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unregisterSelectors',
    inputs: [
      {
        name: 'selectorData',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'selectors', type: 'bytes4[]' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export type OptimisticActionId =
  | 'startRebalance'
  | 'setAuctionLength'
  | 'setBidsEnabled'
  | 'setFeeRecipients'
  | 'setMandate'
  | 'setMintFee'
  | 'setName'
  | 'setRebalanceControl'
  | 'setTVLFee'
  | 'setTrustedFillerRegistry'

export type OptimisticAction = {
  id: OptimisticActionId
  label: string
  description: string
  selector: Hex
}

export const OPTIMISTIC_ACTIONS: OptimisticAction[] = [
  {
    id: 'startRebalance',
    label: 'Start rebalance',
    description: 'Allow optimistic proposals to start basket rebalances.',
    selector: toFunctionSelector(
      'startRebalance((address,(uint256,uint256,uint256),(uint256,uint256),uint256,bool)[],(uint256,uint256,uint256),uint256,uint256)'
    ),
  },
  {
    id: 'setAuctionLength',
    label: 'Auction length',
    description: 'Allow optimistic proposals to change auction duration.',
    selector: toFunctionSelector('setAuctionLength(uint256)'),
  },
  {
    id: 'setBidsEnabled',
    label: 'Permissionless bids',
    description: 'Allow optimistic proposals to enable or disable direct bids.',
    selector: toFunctionSelector('setBidsEnabled(bool)'),
  },
  {
    id: 'setFeeRecipients',
    label: 'Fee recipients',
    description: 'Allow optimistic proposals to change fee distribution.',
    selector: toFunctionSelector('setFeeRecipients((address,uint96)[])'),
  },
  {
    id: 'setMandate',
    label: 'Mandate',
    description: 'Allow optimistic proposals to update the DTF mandate.',
    selector: toFunctionSelector('setMandate(string)'),
  },
  {
    id: 'setMintFee',
    label: 'Mint fee',
    description: 'Allow optimistic proposals to update the mint fee.',
    selector: toFunctionSelector('setMintFee(uint256)'),
  },
  {
    id: 'setName',
    label: 'Token name',
    description: 'Allow optimistic proposals to rename the DTF token.',
    selector: toFunctionSelector('setName(string)'),
  },
  {
    id: 'setRebalanceControl',
    label: 'Rebalance control',
    description: 'Allow optimistic proposals to change rebalance control mode.',
    selector: toFunctionSelector('setRebalanceControl((bool,uint8))'),
  },
  {
    id: 'setTVLFee',
    label: 'TVL fee',
    description: 'Allow optimistic proposals to update the annualized TVL fee.',
    selector: toFunctionSelector('setTVLFee(uint256)'),
  },
  {
    id: 'setTrustedFillerRegistry',
    label: 'Trusted fillers',
    description: 'Allow optimistic proposals to update the trusted filler registry.',
    selector: toFunctionSelector('setTrustedFillerRegistry(address,bool)'),
  },
]

export type OptimisticGovernanceChanges = {
  vetoDelay?: number
  vetoPeriod?: number
  vetoThreshold?: number
  optimisticProposers?: Address[]
  allowedActions?: OptimisticActionId[]
}

export const getOptimisticActionById = (id: OptimisticActionId) =>
  OPTIMISTIC_ACTIONS.find((action) => action.id === id)

export const getOptimisticActionBySelector = (selector: Hex) =>
  OPTIMISTIC_ACTIONS.find(
    (action) => action.selector.toLowerCase() === selector.toLowerCase()
  )

export const percentageToD18 = (percentage: number) => {
  return parseEther((percentage / 100).toFixed(18))
}

export const arraysEqualIgnoreCase = (
  left: readonly string[],
  right: readonly string[]
) => {
  if (left.length !== right.length) return false

  const normalizedLeft = left.map((item) => item.toLowerCase()).sort()
  const normalizedRight = right.map((item) => item.toLowerCase()).sort()

  return normalizedLeft.every((item, index) => item === normalizedRight[index])
}
