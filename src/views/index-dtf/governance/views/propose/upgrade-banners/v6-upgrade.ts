import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { PROPOSAL_STATES } from '@/utils/constants'
import {
  buildIndexDtfUpgradeToV6Calls,
  type IndexDtfProposalSummary,
} from '@reserve-protocol/react-sdk'
import {
  type Address,
  encodeFunctionData,
  isAddressEqual,
  zeroAddress,
} from 'viem'

export const UPGRADE_V6_MESSAGE = 'Release 6.0.0 upgrade'

type Eligibility = {
  version?: string
  spell?: Address
  // undefined while the registry read loads; null when 6.0.0 was never registered.
  deployment?: { deprecated: boolean } | null
  isOptimistic: boolean
  selectorRegistry?: Address
  migrationPending: boolean
}

export type V6UpgradeEligibility =
  | { status: 'hidden' }
  | { status: 'blocked'; reason: 'selector-registry-unresolved' }
  | { status: 'ready'; selectorRegistry: Address }

export const getV6UpgradeEligibility = ({
  version,
  spell,
  deployment,
  isOptimistic,
  selectorRegistry,
  migrationPending,
}: Eligibility): V6UpgradeEligibility => {
  if (version !== '5.0.0' || !spell) return { status: 'hidden' }
  if (!deployment || deployment.deprecated) return { status: 'hidden' }
  if (!isOptimistic) {
    // Legacy DTFs headed for the governance migration must migrate first: upgradeFolio only accepts 4.0.0/5.0.0.
    return migrationPending
      ? { status: 'hidden' }
      : { status: 'ready', selectorRegistry: zeroAddress }
  }
  // The spell rejects a zero registry from an optimistic timelock, so never fall back to it.
  if (!selectorRegistry || isAddressEqual(selectorRegistry, zeroAddress)) {
    return { status: 'blocked', reason: 'selector-registry-unresolved' }
  }
  return { status: 'ready', selectorRegistry }
}

export const buildV6UpgradeProposal = ({
  chainId,
  folio,
  proxyAdmin,
  spell,
  governor,
  selectorRegistry,
  description,
}: {
  chainId: 1 | 8453 | 56
  folio: Address
  proxyAdmin: Address
  spell: Address
  governor: Address
  selectorRegistry: Address
  description: string
}) => {
  const calls = buildIndexDtfUpgradeToV6Calls({
    chainId,
    address: folio,
    proxyAdmin,
    spell,
    selectorRegistry,
  })

  return {
    chainId,
    address: governor,
    abi: DTFIndexGovernance,
    functionName: 'propose' as const,
    args: [
      calls.map((call) => call.contract.address),
      calls.map(() => 0n),
      calls.map((call) =>
        encodeFunctionData({
          abi: call.contract.abi,
          functionName: call.contract.functionName,
          args: call.contract.args,
        } as Parameters<typeof encodeFunctionData>[0])
      ),
      description,
    ] as [Address[], bigint[], `0x${string}`[], string],
  }
}

const LIVE_STATES: string[] = [
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
]

const isUpgradeDescription = (description: string) =>
  description === UPGRADE_V6_MESSAGE ||
  description.startsWith(`${UPGRADE_V6_MESSAGE} #`)

export const hasLiveV6Upgrade = (
  proposals: readonly IndexDtfProposalSummary[],
  governor: Address
) =>
  proposals.some(
    (p) =>
      isUpgradeDescription(p.description) &&
      isAddressEqual(p.governance, governor) &&
      LIVE_STATES.includes(p.votingState.state)
  )

export const nextV6UpgradeDescription = (
  proposals: readonly IndexDtfProposalSummary[]
) => {
  const prefix = `${UPGRADE_V6_MESSAGE} #`
  const nonces = proposals
    .filter((p) => isUpgradeDescription(p.description))
    .map((p) =>
      p.description === UPGRADE_V6_MESSAGE
        ? 1
        : Number.parseInt(p.description.slice(prefix.length), 10)
    )
    .filter(Number.isFinite)
  return `${prefix}${Math.max(0, ...nonces) + 1}`
}
