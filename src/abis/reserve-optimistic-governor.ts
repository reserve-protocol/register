import { Hex } from 'viem'

const reserveOptimisticGovernorAbi = [
  {
    type: 'function',
    name: 'optimisticParams',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'vetoDelay', type: 'uint48' },
      { name: 'vetoPeriod', type: 'uint32' },
      { name: 'vetoThreshold', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'isOptimistic',
    stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'proposalThrottleCapacity',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'selectorRegistry',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'timelock',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

export const optimisticSelectorRegistryAbi = [
  {
    type: 'function',
    name: 'targets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'selectorsAllowed',
    stateMutability: 'view',
    inputs: [{ name: 'target', type: 'address' }],
    outputs: [{ name: '', type: 'bytes4[]' }],
  },
] as const

export const optimisticTimelockAbi = [
  {
    type: 'function',
    name: 'getRoleMemberCount',
    stateMutability: 'view',
    inputs: [{ name: 'role', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getRoleMember',
    stateMutability: 'view',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

export const OPTIMISTIC_PROPOSER_ROLE =
  '0x26f49d08685d9cdd4951a7470bc8fbe9dd0f00419c1a44c1b89f845867ae12e0' as Hex

export const CANCELLER_ROLE =
  '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783' as Hex

export default reserveOptimisticGovernorAbi
