import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { ChainId } from '@/utils/chains'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Address, encodeFunctionData, getAddress, Hex, pad } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { toast } from 'sonner'

export const spellAbi = [
  {
    inputs: [
      {
        internalType: 'contract IReserveOptimisticGovernorDeployer',
        name: '_governorDeployer',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'code',
        type: 'uint256',
      },
    ],
    name: 'UpgradeError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'contract Folio',
        name: 'folio',
        type: 'address',
      },
      {
        internalType: 'contract FolioProxyAdmin',
        name: 'folioProxyAdmin',
        type: 'address',
      },
      {
        internalType: 'contract IStakingVault',
        name: 'newStakingVault',
        type: 'address',
      },
      {
        internalType: 'contract IFolioGovernor',
        name: 'oldFolioGovernor',
        type: 'address',
      },
      {
        internalType: 'contract IFolioGovernor',
        name: 'tradingGovernor',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint48',
            name: 'vetoDelay',
            type: 'uint48',
          },
          {
            internalType: 'uint32',
            name: 'vetoPeriod',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'vetoThreshold',
            type: 'uint256',
          },
        ],
        internalType:
          'struct IReserveOptimisticGovernor.OptimisticGovernanceParams',
        name: 'optimisticParams',
        type: 'tuple',
      },
      {
        internalType: 'address[]',
        name: 'optimisticProposers',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'guardians',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'newFeeRecipient',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'deploymentNonce',
        type: 'bytes32',
      },
    ],
    name: 'upgradeFolio',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'stakingVault',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'newGovernor',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'newTimelock',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'newSelectorRegistry',
            type: 'address',
          },
        ],
        internalType: 'struct GovernanceSpell_04_17_2026.NewDeployment',
        name: 'newDeployment',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const spellAddress: Record<number, `0x${string}`> = {
  [ChainId.Mainnet]: getAddress('0x082E701456cd702fBE5797Ab515e6B00580E5a14'),
  [ChainId.Base]: getAddress('0x0aDc69041a2B086f8772aCcE2A754f410F211bed'),
  [ChainId.BSC]: getAddress('0x02Ee6862cF431D7CEaa78112D635D2Be7DdFC178'),
}

export const optimisticStakingVaultAddress: Record<number, Address> = {
  [ChainId.Mainnet]: getAddress('0x0726D9d0E86Da9bE70985C8D8B2AB1Ff42eCe521'),
  [ChainId.Base]: getAddress('0x7B9Cf042d772F1C176D31d37Be1eef29De427044'),
  [ChainId.BSC]: getAddress('0x4D43E95D8AF20aA65695ED2A3B7eC0d2CC88908F'),
}

export const newFeeRecipientAddress: Record<number, Address> = {
  [ChainId.Mainnet]: getAddress('0x9811e38b57ad9bC498F60090Eb8d0C68436D037E'),
  [ChainId.Base]: getAddress('0x490c31f0aC5C34cA7d6De03925e3b89A899D1ECD'),
  [ChainId.BSC]: getAddress('0xf67454a5e8081F52768cD350A4Ac9E832c5101b6'),
}

const UPGRADE_FOLIO_MESSAGE = 'Reserve Optimistic Governor upgrade'

const matchesUpgradeMessage = (description: string) =>
  description === UPGRADE_FOLIO_MESSAGE ||
  description.startsWith(`${UPGRADE_FOLIO_MESSAGE} #`)

const getNextUpgradeDescription = (
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
  return `${UPGRADE_FOLIO_MESSAGE} #${maxNonce + 1}`
}

type SpellUpgradeProps = {
  refetch: () => void
  description: string
}

const ProposeBanner = ({ refetch, description }: SpellUpgradeProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]
  const handleRecentProposalReceipt = useRecentProposalReceipt()

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  const isReady =
    dtf?.id &&
    dtf?.proxyAdmin &&
    dtf?.ownerGovernance?.id &&
    dtf?.tradingGovernance?.id
  const proposalAvailable = !!spell

  const handlePropose = () => {
    if (!dtf || !spell || !dtf.ownerGovernance || !dtf.tradingGovernance) return

    const newVaultAddress = optimisticStakingVaultAddress[chainId]
    const oldFolioGovernor = dtf.ownerGovernance.id
    const tradingGovernor = dtf.tradingGovernance.id
    const optimisticParams = {
      vetoDelay: 43_200, // 12h
      vetoPeriod: 129_600, // 36h
      vetoThreshold: 20_000_000_000_000_000n, // 2%
    } as const
    const optimisticProposers = [
      getAddress('0x7DaAf7Bc2eE8bf4C0ac7f37E6b6cfaEB3ed9a868'),
    ]
    const guardians = dtf.ownerGovernance.timelock.guardians.filter(
      (guardian) => guardian.toLowerCase() !== oldFolioGovernor.toLowerCase()
    )
    const newFeeRecipient = newFeeRecipientAddress[chainId]
    // Generate a random 32-byte value for deploymentNonce as bytes32
    const deploymentNonce = `0x${[...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}` as Hex

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
            functionName: 'upgradeFolio',
            args: [
              dtf.id,
              dtf.proxyAdmin,
              newVaultAddress,
              oldFolioGovernor,
              tradingGovernor,
              optimisticParams,
              optimisticProposers,
              guardians,
              newFeeRecipient,
              deploymentNonce,
            ],
          }),
        ],
        description,
      ],
    })
  }

  useEffect(() => {
    if (!isSuccess || !receipt || !dtf?.ownerGovernance?.id) return

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.ownerGovernance.id,
      onSuccess: () => {
        toast('Proposal created!', {
          description: 'Reserve Optimistic Governor Upgrade proposal created',
          icon: '🎉',
        })
        refetch()
      },
      onFallback: () => {
        setTimeout(() => {
          toast('Proposal created!', {
            description: 'Reserve Optimistic Governor Upgrade proposal created',
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
  ])

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
            <strong>Reserve Optimistic Governor upgrade</strong> introduces a
            new governor system TBD COPY HERE!. <br />
            See the{' '}
            <a
              className="text-primary underline"
              href="https://github.com/reserve-protocol/reserve-index-dtf/releases/tag/r5.0.0"
              target="_blank"
            >
              changelog
            </a>{' '}
            for more details.
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!hash}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || !!hash) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!hash && 'Waiting for confirmation...'}
        {!isPending && !hash && 'Propose upgrade'}
      </Button>
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
  const setRefetchToken = useSetAtom(refetchTokenAtom)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  // Show banner for v5.x DTFs
  const isUpgradeable = typeof version === 'string' && version.startsWith('5.')

  if (!isProposeAllowed || !proposals || !isUpgradeable) return null

  const existsFolioUpgrade = validProposalExists(proposals)

  // if (existsFolioUpgrade) {
  //   return null
  // }

  const description = getNextUpgradeDescription(proposals)

  return <ProposeBanner refetch={refetch} description={description} />
}
