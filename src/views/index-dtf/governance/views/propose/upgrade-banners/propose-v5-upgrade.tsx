import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { getProposalState, PartialProposal } from '@/lib/governance'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { ChainId } from '@/utils/chains'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { encodeFunctionData, getAddress, pad } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import { toast } from 'sonner'

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

type SpellUpgradeProps = {
  refetch: () => void
}

const ProposeBanner = ({ refetch }: SpellUpgradeProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]

  const { writeContract, data, isPending } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const isReady =
    dtf?.id &&
    dtf?.proxyAdmin &&
    dtf?.ownerGovernance?.id &&
    dtf?.tradingGovernance?.id
  const proposalAvailable = !!spell

  const handlePropose = () => {
    if (!dtf || !spell || !dtf.ownerGovernance) return

    writeContract({
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
        UPGRADE_FOLIO_MESSAGE,
      ],
    })
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        toast('Proposal created!', {
          description: 'DTF V5.0.0 upgrade proposal created',
          icon: '🎉',
        })
        refetch()
      }, 10000)
    }
  }, [isSuccess])

  if (!proposalAvailable) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">New version available</h4>
          <p className="text-sm">
            Release 5.0.0 introduces improved rebalancing with per-token auction
            size limits and the ability to disable bids for individual tokens.
            See docs.reserve.org for more details.
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!data}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Propose upgrade'}
      </Button>
    </div>
  )
}

const validProposalExists = (
  proposals: PartialProposal[],
  description: string
): boolean => {
  const states = [
    PROPOSAL_STATES.PENDING,
    PROPOSAL_STATES.ACTIVE,
    PROPOSAL_STATES.SUCCEEDED,
    PROPOSAL_STATES.QUEUED,
    PROPOSAL_STATES.EXECUTED,
  ]
  return proposals.some((p) => {
    if (p.description !== description) {
      return false
    }

    const pState = getProposalState(p)

    if (pState.state === PROPOSAL_STATES.EXPIRED) {
      return false
    }

    return states.includes(pState.state)
  })
}

const UPGRADE_WHITELIST: string[] = []

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
  const isUpgradeable = version.startsWith('4.') && UPGRADE_WHITELIST.includes(dtf?.id ?? '')

  if (!isProposeAllowed || !proposals || !isUpgradeable) return null

  const existsFolioUpgrade = validProposalExists(
    proposals,
    UPGRADE_FOLIO_MESSAGE
  )

  if (existsFolioUpgrade) {
    return null
  }

  return <ProposeBanner refetch={refetch} />
}
