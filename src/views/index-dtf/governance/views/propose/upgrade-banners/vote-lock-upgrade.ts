import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import {
  decodeFunctionData,
  encodeFunctionData,
  parseAbi,
  toFunctionSelector,
  zeroAddress,
  type Address,
  type Hex,
} from 'viem'

export const VOTE_LOCK_UPGRADE_MESSAGE = 'Upgrade vote-lock governance to 1.1.0'
export const VOTE_LOCK_UPGRADE_FROM = '1.0.0'
export const VOTE_LOCK_UPGRADE_TO = '1.1.0'

export const voteLockUpgradeAbi = parseAbi([
  'function version() view returns (string)',
  'function versionRegistry() view returns (address)',
  'function timelock() view returns (address)',
  'function getLatestVersion() view returns (bytes32 versionHash, string version, address deployer, bool deprecated)',
  'function getImplementationsForVersion(bytes32 versionHash) view returns (address stakingVaultImpl, address governorImpl, address timelockImpl)',
  'function upgradeToAndCall(address newImplementation, bytes data) payable',
  'function initializeAverageVotes()',
  'function initializeVersionRegistry(address registry)',
])

type Implementations = {
  vault?: Address
  governor?: Address
  timelock?: Address
}

export type VoteLockUpgradeReads = {
  versions: { vault?: string; governor?: string; timelock?: string }
  latest?: { version: string; deprecated: boolean }
  implementations?: Implementations
  governorTimelock?: Address
  timelock?: Address
}

const isSet = (address: Address | undefined): address is Address =>
  !!address && address !== zeroAddress

// The 1.1.0 vault and components check the registry's latest version on upgrade, so only offer
// the hop from 1.0.0 straight to a live 1.1.0.
export const getVoteLockUpgradeEligibility = ({
  versions,
  latest,
  implementations,
  governorTimelock,
  timelock,
}: VoteLockUpgradeReads): boolean =>
  versions.vault === VOTE_LOCK_UPGRADE_FROM &&
  versions.governor === VOTE_LOCK_UPGRADE_FROM &&
  versions.timelock === VOTE_LOCK_UPGRADE_FROM &&
  latest?.version === VOTE_LOCK_UPGRADE_TO &&
  !latest.deprecated &&
  isSet(implementations?.vault) &&
  isSet(implementations?.governor) &&
  isSet(implementations?.timelock) &&
  isSet(timelock) &&
  governorTimelock?.toLowerCase() === timelock.toLowerCase()

export const buildVoteLockUpgradeProposal = ({
  chainId,
  governor,
  vault,
  timelock,
  registry,
  implementations,
  description,
}: {
  chainId: number
  governor: Address
  vault: Address
  timelock: Address
  registry: Address
  implementations: Required<Implementations>
  description: string
}) => {
  const upgrade = (implementation: Address, init: `0x${string}`) =>
    encodeFunctionData({
      abi: voteLockUpgradeAbi,
      functionName: 'upgradeToAndCall',
      args: [implementation, init],
    })
  const initRegistry = encodeFunctionData({
    abi: voteLockUpgradeAbi,
    functionName: 'initializeVersionRegistry',
    args: [registry],
  })

  return {
    chainId,
    address: governor,
    abi: DTFIndexGovernance,
    functionName: 'propose' as const,
    args: [
      [vault, governor, timelock],
      [0n, 0n, 0n],
      [
        upgrade(
          implementations.vault,
          encodeFunctionData({
            abi: voteLockUpgradeAbi,
            functionName: 'initializeAverageVotes',
          })
        ),
        upgrade(implementations.governor, initRegistry),
        upgrade(implementations.timelock, initRegistry),
      ],
      description,
    ] as const,
  }
}

const LIVE_STATES: string[] = [
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
]

const matchesMessage = (description: string) =>
  description === VOTE_LOCK_UPGRADE_MESSAGE ||
  description.startsWith(`${VOTE_LOCK_UPGRADE_MESSAGE} #`)

export const hasLiveVoteLockUpgrade = (
  proposals: readonly IndexDtfProposalSummary[]
) =>
  proposals.some(
    (p) =>
      matchesMessage(p.description) && LIVE_STATES.includes(p.votingState.state)
  )

export const nextVoteLockUpgradeDescription = (
  proposals: readonly IndexDtfProposalSummary[]
) => {
  const prefix = `${VOTE_LOCK_UPGRADE_MESSAGE} #`
  let max = 0
  for (const { description } of proposals) {
    if (description === VOTE_LOCK_UPGRADE_MESSAGE) max = Math.max(max, 1)
    else if (description.startsWith(prefix)) {
      const n = Number.parseInt(description.slice(prefix.length), 10)
      if (Number.isFinite(n)) max = Math.max(max, n)
    }
  }
  return `${prefix}${max + 1}`
}

export const UPGRADE_TO_AND_CALL_SELECTOR = toFunctionSelector(
  'upgradeToAndCall(address,bytes)'
)

export type VoteLockUpgradeCall = {
  implementation: Address
  initializer: string
  registry?: Address
}

// The SDK decoder has no UUPS upgrade entries, so Register decodes these calls itself.
export const decodeVoteLockUpgradeCall = (
  calldata: Hex
): VoteLockUpgradeCall | undefined => {
  if (calldata.slice(0, 10).toLowerCase() !== UPGRADE_TO_AND_CALL_SELECTOR) {
    return undefined
  }
  try {
    const { args } = decodeFunctionData({ abi: voteLockUpgradeAbi, data: calldata })
    const [implementation, init] = args as readonly [Address, Hex]
    if (init === '0x') return { implementation, initializer: '' }
    try {
      const decoded = decodeFunctionData({ abi: voteLockUpgradeAbi, data: init })
      return {
        implementation,
        initializer: decoded.functionName,
        ...(decoded.functionName === 'initializeVersionRegistry'
          ? { registry: (decoded.args as readonly [Address])[0] }
          : {}),
      }
    } catch {
      return { implementation, initializer: init.slice(0, 10) }
    }
  } catch {
    return undefined
  }
}
