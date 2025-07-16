import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi'
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
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import { toast } from 'sonner'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'

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
] as const

export const spellAddress = {
  [ChainId.Mainnet]: getAddress('0x7498c6aB0669A09DE7B9185ba72A98fa3Ca39cC9'),
  [ChainId.Base]: getAddress('0x4720dbCAEEF5834AEf590781F93d70fD1e3AcADB'),
}

const fillerRegistryMapping = {
  [ChainId.Mainnet]: getAddress('0x279ccF56441fC74f1aAC39E7faC165Dec5A88B3A'),
  [ChainId.Base]: getAddress('0x72DB5f49D0599C314E2f2FEDf6Fe33E1bA6C7A18'),
}

const UPGRADE_FOLIO_MESSAGE = 'DTF V4 Upgrade'

const queryParams = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
} as const

type SpellUpgradeProps = {
  refetch: () => void
}

const ProposeBanner = ({ refetch }: SpellUpgradeProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]

  const { data: qdOwnerGov } = useReadContract({
    abi: DTFIndexGovernance,
    address: dtf?.ownerGovernance?.id,
    functionName: 'quorumDenominator',
    chainId,
    query: queryParams,
  })

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
  const proposalAvailable = !!spell && qdOwnerGov === 100n

  const handlePropose = () => {
    if (!dtf || !spell || !dtf.ownerGovernance || qdOwnerGov !== 100n) return

    writeContract({
      address: dtf.ownerGovernance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [dtf.id, dtf.proxyAdmin, spell, dtf.id],
        [0n, 0n, 0n, 0n],
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
          encodeFunctionData({
            abi: dtfIndexAbiV4,
            functionName: 'setTrustedFillerRegistry',
            args: [fillerRegistryMapping[chainId], true],
          }),
        ],
        UPGRADE_FOLIO_MESSAGE,
      ],
    })
  }

  useEffect(() => {
    if (isSuccess) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        toast('Proposal created!', {
          description: 'DTF V4.0.0 upgrade proposal created',
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
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque
            sunt, nemo id blanditiis totam vel aut modi in deleniti ipsam ab
            molestias voluptatum tempora placeat soluta magni accusamus eveniet
            recusandae.
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

// TODO(jg): Enable Staking Vault spell when DAO gov is fixed
export default function ProposeBanners() {
  const { isProposeAllowed } = useIsProposeAllowed()
  const proposals = useAtomValue(governanceProposalsAtom)
  const isUpgradeable = useAtomValue(indexDTFVersionAtom) === '2.0.0'
  const setRefetchToken = useSetAtom(refetchTokenAtom)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

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
