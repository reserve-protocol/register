import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { RSR_ADDRESS } from '@/utils/addresses'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  useIndexDtfVoteLockDependents,
  type IndexDtfProposalSummary,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  type Address,
  encodeFunctionData,
  isAddressEqual,
  parseAbi,
  zeroAddress,
} from 'viem'
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import {
  getOldVoteLocks,
  governanceSpellAddress,
  type OldVoteLock,
} from '@/views/index-dtf/components/vote-lock-migration/governance-migration'

const ownableVaultAbi = parseAbi([
  'function owner() view returns (address)',
  'function asset() view returns (address)',
  'function transferOwnership(address newOwner)',
])
const governorTimelockAbi = parseAbi(['function timelock() view returns (address)'])
const retireSpellAbi = parseAbi([
  'function retireOldStakingVault(address oldStakingVault)',
])
const RETIRE_MESSAGE = 'Retire legacy vote-lock vault'
const LIVE_STATES = [
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
]

const retirePrefix = (voteLock: Address) => `${RETIRE_MESSAGE} ${voteLock} #`

const retireProposals = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) => proposals.filter((p) => p.description.startsWith(retirePrefix(voteLock)))

// Governor proposal ids hash the description, so a retry after a defeated or expired attempt needs a new nonce.
const nextRetireDescription = (
  proposals: readonly IndexDtfProposalSummary[],
  voteLock: Address
) => {
  const nonces = retireProposals(proposals, voteLock).map((p) =>
    Number.parseInt(p.description.slice(retirePrefix(voteLock).length), 10)
  )
  return `${retirePrefix(voteLock)}${Math.max(0, ...nonces.filter(Number.isFinite)) + 1}`
}

type RetireBannerProps = {
  voteLock: Required<OldVoteLock>
  pending: readonly { symbol: string }[]
  description: string
  refetch: () => void
}

const RetireBanner = ({
  voteLock,
  pending,
  description,
  refetch,
}: RetireBannerProps) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const spell = governanceSpellAddress[chainId]
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const {
    data: receipt,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash, chainId })
  const isConfirming = !!hash && !receipt && !receiptError
  const isSubmitted = isConfirming || receipt?.status === 'success'
  const isBlocked = pending.length > 0

  const handlePropose = () => {
    if (!spell || isBlocked) return

    writeContract({
      chainId,
      address: voteLock.governance,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [voteLock.address, spell],
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
            args: [voteLock.address],
          }),
        ],
        description,
      ],
    })
  }

  useEffect(() => {
    if (!isSuccess || receipt?.status !== 'success') return

    const notify = () => {
      toast(t`Proposal created!`, {
        description: t`Legacy vote-lock vault retirement proposal created`,
        icon: '🎉',
      })
      refetch()
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: voteLock.governance,
      onSuccess: notify,
      onFallback: () => setTimeout(notify, 10000),
    })
  }, [
    handleRecentProposalReceipt,
    isSuccess,
    receipt,
    refetch,
    t,
    voteLock.governance,
  ])

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>Retire the legacy vote-lock vault</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              Sets the old vault's unstaking delay to zero so voters can move
              their RSR to the shared vlRSR vault right away.
            </Trans>
          </p>
        </div>
      </div>
      {isBlocked && (
        <Alert
          variant="warning"
          data-testid="governance-retire-vote-lock-pending"
          className="mt-3 rounded-2xl text-sm"
        >
          <TriangleAlert size={16} />
          <AlertDescription>
            <Trans>
              Still governed by this vault:{' '}
              {pending.map(({ symbol }) => symbol).join(', ')}. Each must pass
              its governance upgrade before the vault can be retired.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      <Button
        data-testid="governance-retire-vote-lock-btn"
        disabled={isBlocked || isPending || isSubmitted}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose vault retirement`}
      </Button>
    </div>
  )
}

export default function ProposeRetireVoteLock() {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  const candidates = dtf
    ? getOldVoteLocks(dtf, chainId).filter(
        (candidate): candidate is Required<OldVoteLock> =>
          !!candidate.governance
      )
    : []
  const { data: ownership } = useReadContracts({
    contracts: candidates.flatMap(({ address, governance }) => [
      { address, abi: ownableVaultAbi, functionName: 'owner', chainId },
      { address, abi: ownableVaultAbi, functionName: 'asset', chainId },
      {
        address: governance,
        abi: governorTimelockAbi,
        functionName: 'timelock',
        chainId,
      },
    ]),
    query: { enabled: candidates.length > 0 },
  })
  const rsr = RSR_ADDRESS[chainId]
  // Retirable: an RSR vault still owned (not renounced) by the DAO timelock that will execute the proposal.
  const voteLock = candidates.find((_, i) => {
    const [owner, asset, timelock] = (ownership ?? [])
      .slice(i * 3, i * 3 + 3)
      .map(({ result }) => result as Address | undefined)
    return (
      !!owner &&
      owner !== zeroAddress &&
      !!timelock &&
      isAddressEqual(owner, timelock) &&
      !!asset &&
      !!rsr &&
      isAddressEqual(asset, rsr)
    )
  })
  const { isProposeAllowed } = useIsProposeAllowed(voteLock?.governance)
  const { data: dependents } = useIndexDtfVoteLockDependents(
    dtf && voteLock ? { chainId: dtf.chainId, voteLock: voteLock.address } : undefined
  )

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  if (!voteLock || !isProposeAllowed || !proposals || !dependents) return null
  const live = retireProposals(proposals, voteLock.address).some((p) =>
    LIVE_STATES.includes(p.votingState.state)
  )
  if (live) return null

  return (
    <RetireBanner
      voteLock={voteLock}
      pending={dependents.filter(({ governedByVoteLock }) => governedByVoteLock)}
      description={nextRetireDescription(proposals, voteLock.address)}
      refetch={refetch}
    />
  )
}
