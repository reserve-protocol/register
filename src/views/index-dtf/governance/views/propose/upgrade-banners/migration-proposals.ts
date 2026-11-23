import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { getProposalTitle } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { encodeFunctionData, getAddress, parseAbi, type Address } from 'viem'

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
// MAG7 and the AI DTFs moved to vlRSR; their deploy vaults only hold the deployer's seed stake, so there is nothing to retire.
const UNUSED_DEPLOY_VAULTS: Record<number, readonly Address[]> = {
  1: [
    getAddress('0x6d586c6ece79db0a5a3b7fde1e09d59724037769'), // vlRSR-BUILDOUT
    getAddress('0x703f8a8b2ecca6fdc75bcbdeb92848d077cc179c'), // vlRSR-PHOTON
  ],
  8453: [
    getAddress('0x9cff81dc5e5de6420e67d4986082158379927f9e'), // vlRSR-MAG7
    getAddress('0x08ce0b188fa46898b85486cd8341b4b8783fc2ed'), // vlRSR-MAG7
    getAddress('0xa16770ebb62fc5a77418d1050cfdc3ffcc113ec3'), // vlRSR-MAG7
  ],
  56: [
    getAddress('0x24f3248c9e9fc17577c92ffeed1afd15a5ebc80d'), // vlRSR-BUILDOUT
    getAddress('0x2575953e4644da528d6a61eff1095b2eb757d71f'), // vlRSR-PHOTON
  ],
}

export const isUnusedDeployVault = (chainId: number, vault: Address) =>
  (UNUSED_DEPLOY_VAULTS[chainId] ?? []).includes(getAddress(vault))

const retireSpellAbi = parseAbi([
  'function retireOldStakingVault(address oldStakingVault)',
])

const matchesUpgradeMessage = (description: string) => {
  const title = getProposalTitle(description)
  return (
    title === UPGRADE_FOLIO_MESSAGE ||
    title.startsWith(`${UPGRADE_FOLIO_MESSAGE} #`)
  )
}

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
    const title = getProposalTitle(p.description)
    if (title === UPGRADE_FOLIO_MESSAGE) {
      maxNonce = Math.max(maxNonce, 1)
    } else if (title.startsWith(prefix)) {
      const n = Number.parseInt(title.slice(prefix.length), 10)
      if (Number.isFinite(n)) maxNonce = Math.max(maxNonce, n)
    }
  }
  return `${prefix}${maxNonce + 1}`
}

const retirePrefix = (voteLock: Address) => `${RETIRE_MESSAGE} ${voteLock} #`

const retireProposals = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) =>
  proposals.filter((p) =>
    getProposalTitle(p.description).startsWith(retirePrefix(voteLock))
  )

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
    Number.parseInt(
      getProposalTitle(p.description).slice(retirePrefix(voteLock).length),
      10
    )
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
