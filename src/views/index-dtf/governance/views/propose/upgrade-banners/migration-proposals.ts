import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { encodeFunctionData, parseAbi, type Address } from 'viem'

export const UPGRADE_FOLIO_MESSAGE = 'Reserve Optimistic Governor upgrade'
const RETIRE_MESSAGE = 'Retire legacy vote-lock vault'

const LIVE_STATES: string[] = [
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
]

export const ownableVaultAbi = parseAbi([
  'function owner() view returns (address)',
  'function asset() view returns (address)',
  'function transferOwnership(address newOwner)',
])
const retireSpellAbi = parseAbi([
  'function retireOldStakingVault(address oldStakingVault)',
])

const matchesUpgradeMessage = (description: string) =>
  description === UPGRADE_FOLIO_MESSAGE ||
  description.startsWith(`${UPGRADE_FOLIO_MESSAGE} #`)

export const hasLiveUpgradeFolio = (proposals: readonly IndexDtfProposalSummary[]) =>
  proposals.some(
    (p) =>
      matchesUpgradeMessage(p.description) &&
      LIVE_STATES.includes(p.votingState.state)
  )

export const nextUpgradeFolioDescription = (
  proposals: readonly IndexDtfProposalSummary[]
): string => {
  let maxNonce = 0
  const prefix = `${UPGRADE_FOLIO_MESSAGE} #`
  for (const p of proposals) {
    if (p.description === UPGRADE_FOLIO_MESSAGE) {
      maxNonce = Math.max(maxNonce, 1)
    } else if (p.description.startsWith(prefix)) {
      const n = Number.parseInt(p.description.slice(prefix.length), 10)
      if (Number.isFinite(n)) maxNonce = Math.max(maxNonce, n)
    }
  }
  return `${prefix}${maxNonce + 1}`
}

const retirePrefix = (voteLock: Address) => `${RETIRE_MESSAGE} ${voteLock} #`

const retireProposals = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) => proposals.filter((p) => p.description.startsWith(retirePrefix(voteLock)))

export const hasLiveRetire = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) =>
  retireProposals(proposals, voteLock).some((p) =>
    LIVE_STATES.includes(p.votingState.state)
  )

// Governor proposal ids hash the description, so a retry after a defeated or expired attempt needs a new nonce.
export const nextRetireDescription = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) => {
  const nonces = retireProposals(proposals, voteLock).map((p) =>
    Number.parseInt(p.description.slice(retirePrefix(voteLock).length), 10)
  )
  return `${retirePrefix(voteLock)}${Math.max(0, ...nonces.filter(Number.isFinite)) + 1}`
}

export const buildRetireProposal = ({
  chainId,
  governor,
  voteLock,
  spell,
  description,
}: {
  chainId: number
  governor: Address
  voteLock: Address
  spell: Address
  description: string
}) => ({
  chainId,
  address: governor,
  abi: DTFIndexGovernance,
  functionName: 'propose' as const,
  args: [
    [voteLock, spell],
    [0n, 0n],
    [
      encodeFunctionData({
        abi: ownableVaultAbi,
        functionName: 'transferOwnership',
        args: [spell],
      }),
      encodeFunctionData({
        abi: retireSpellAbi,
        functionName: 'retireOldStakingVault',
        args: [voteLock],
      }),
    ],
    description,
  ] as const,
})
