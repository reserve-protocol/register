import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import UpgradeProposalButton from './upgrade-proposal-button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { getCurrentTime, getProposalTitle } from '@/utils'
import { ChainId } from '@/utils/chains'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { encodeFunctionData, getAddress, pad } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { toast } from 'sonner'
import { Trans, useLingui } from '@lingui/react/macro'

export const spellAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [
      { internalType: 'contract Folio', name: 'folio', type: 'address' },
      {
        internalType: 'contract FolioProxyAdmin',
        name: 'proxyAdmin',
        type: 'address',
      },
    ],
    name: 'cast',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

export const spellAddress: Record<number, `0x${string}`> = {
  [ChainId.Mainnet]: getAddress('0x044B6F685FB8D0c3fd56D92FCBE5F0Ad947d2D53'),
  [ChainId.Base]: getAddress('0x04B3eD311C68dfB0649D9faf695115F23DcbB540'),
  [ChainId.BSC]: getAddress('0xe8e67a366e5166c442B6D376ADc772b93CdE7825'),
}

const UPGRADE_FOLIO_MESSAGE = 'Release 5.0.0 upgrade'

const matchesUpgradeMessage = (description: string) => {
  const title = getProposalTitle(description)
  return (
    title === UPGRADE_FOLIO_MESSAGE ||
    title.startsWith(`${UPGRADE_FOLIO_MESSAGE} #`)
  )
}

const getNextUpgradeDescription = (
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
  return `${UPGRADE_FOLIO_MESSAGE} #${maxNonce + 1}`
}

type SpellUpgradeProps = {
  refetch: () => void
  initialTitle: string
}

const ProposeBanner = ({ refetch, initialTitle }: SpellUpgradeProps) => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]
  const handleRecentProposalReceipt = useRecentProposalReceipt()

  const { writeContract, data: hash, isPending } = useWriteContract()

  const {
    data: receipt,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })
  const isConfirming = !!hash && !receipt && !receiptError
  const isSubmitted = isConfirming || receipt?.status === 'success'

  const isReady =
    dtf?.id &&
    dtf?.proxyAdmin &&
    dtf?.ownerGovernance?.id &&
    dtf?.tradingGovernance?.id
  const proposalAvailable = !!spell

  const handlePropose = (proposalDescription: string) => {
    if (!dtf || !spell || !dtf.ownerGovernance) return

    writeContract({
      chainId,
      address: dtf.ownerGovernance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [dtf.id, dtf.proxyAdmin, spell],
        [0n, 0n, 0n],
        [
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'grantRole',
            args: [pad('0x0', { size: 32 }), spell],
          }),
          encodeFunctionData({
            abi: dtfAdminAbi,
            functionName: 'transferOwnership',
            args: [spell],
          }),
          encodeFunctionData({
            abi: spellAbi,
            functionName: 'cast',
            args: [dtf.id, dtf.proxyAdmin],
          }),
        ],
        proposalDescription,
      ],
    })
  }

  useEffect(() => {
    if (
      !isSuccess ||
      !receipt ||
      receipt.status !== 'success' ||
      !dtf?.ownerGovernance?.id
    ) {
      return
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.ownerGovernance.id,
      onSuccess: () => {
        toast(t`Proposal created!`, {
          description: t`DTF V5.0.0 upgrade proposal created`,
          icon: '🎉',
        })
        refetch()
      },
      onFallback: () => {
        setTimeout(() => {
          toast(t`Proposal created!`, {
            description: t`DTF V5.0.0 upgrade proposal created`,
            icon: '🎉',
          })
          refetch()
        }, 10000)
      },
    })
  }, [
    dtf?.ownerGovernance?.id,
    handleRecentProposalReceipt,
    isSuccess,
    receipt,
    refetch,
    t,
  ])

  if (!proposalAvailable) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>New version available</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              <strong>Release 5.0.0</strong> introduces improved rebalancing
              with per-token auction size limits and the ability to disable bids
              for individual tokens. <br />
              See the{' '}
              <a
                className="text-primary underline"
                href="https://github.com/reserve-protocol/reserve-index-dtf/releases/tag/r5.0.0"
                target="_blank"
              >
                changelog
              </a>{' '}
              for more details.
            </Trans>
          </p>
        </div>
      </div>
      <UpgradeProposalButton
        initialDescription={t`Upgrade this DTF to release 5.0.0, adding per-token auction size limits and the ability to disable bids for individual tokens.`}
        initialTitle={initialTitle}
        disabled={!isReady || isPending || isSubmitted}
        onSubmit={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose upgrade`}
      </UpgradeProposalButton>
    </div>
  )
}

const validProposalExists = (
  proposals: readonly IndexDtfProposalSummary[]
): boolean => {
  const states = [
    PROPOSAL_STATES.PENDING,
    PROPOSAL_STATES.ACTIVE,
    PROPOSAL_STATES.SUCCEEDED,
    PROPOSAL_STATES.QUEUED,
    PROPOSAL_STATES.EXECUTED,
  ]
  return proposals.some((p) => {
    if (!matchesUpgradeMessage(p.description)) {
      return false
    }

    if (p.votingState.state === PROPOSAL_STATES.EXPIRED) {
      return false
    }

    return states.includes(p.votingState.state)
  })
}

export default function ProposeV5Upgrade() {
  const { isProposeAllowed } = useIsProposeAllowed()
  const proposals = useAtomValue(governanceProposalsAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  // Show banner for v4.x DTFs (4.0.0 and 4.0.1)
  const isUpgradeable = typeof version === 'string' && version.startsWith('4.')

  if (!isProposeAllowed || !proposals || !isUpgradeable) return null

  const existsFolioUpgrade = validProposalExists(proposals)

  if (existsFolioUpgrade) {
    return null
  }

  const initialTitle = getNextUpgradeDescription(proposals)

  return <ProposeBanner refetch={refetch} initialTitle={initialTitle} />
}
