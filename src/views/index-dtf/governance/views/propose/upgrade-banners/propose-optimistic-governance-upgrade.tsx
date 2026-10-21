import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { trackClick } from '@/hooks/useTrackPage'
import { getCurrentTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { encodeFunctionData, getAddress, Hex, pad } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { toast } from 'sonner'
import {
  getGovernanceUpgradeTarget,
  optimisticStakingVaultAddress,
} from '@/components/vote-lock/migration/migration-targets'
import { useOptimisticUpgradeEligibility } from '@/views/index-dtf/components/vote-lock-migration/use-upgrade-eligibility'
import { hasLiveUpgradeFolio, nextUpgradeFolioDescription } from './migration-proposals'

const spellAbi = [
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
        internalType: 'struct GovernanceSpell_09_18_2026.NewDeployment',
        name: 'newDeployment',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

type SpellUpgradeProps = {
  refetch: () => void
  description: string
}

const ProposeBanner = ({ refetch, description }: SpellUpgradeProps) => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const target = dtf ? getGovernanceUpgradeTarget(chainId, dtf.id) : undefined
  const spell = target?.spell
  const isSharedVault =
    target?.stakingVault === optimisticStakingVaultAddress[chainId]
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

  const handlePropose = () => {
    if (
      !dtf ||
      !target ||
      !spell ||
      !dtf.ownerGovernance ||
      !dtf.tradingGovernance
    )
      return

    trackClick('governance', 'propose_governance_upgrade', dtf.id, dtf.token.symbol, chainId)
    const newVaultAddress = target.stakingVault
    const oldFolioGovernor = dtf.ownerGovernance.id
    const tradingGovernor = dtf.tradingGovernance.id
    const optimisticParams = {
      vetoDelay: 14_400, // 4h
      vetoPeriod: 72_000, // 20h
      vetoThreshold: 10_000_000_000_000_000n, // 1%
    } as const
    const optimisticProposers = [
      getAddress('0xF770497BC14dA0E88F65A5C446484c7CEcbEA661'),
    ]
    const guardians = dtf.ownerGovernance.timelock.guardians.filter(
      (guardian) => guardian.toLowerCase() !== oldFolioGovernor.toLowerCase()
    )
    const newFeeRecipient = target.feeRecipient
    // Generate a random 32-byte value for deploymentNonce as bytes32
    const deploymentNonce = `0x${[...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}` as Hex

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
          description: t`Reserve Optimistic Governor Upgrade proposal created`,
          icon: '🎉',
        })
        refetch()
      },
      onFallback: () => {
        setTimeout(() => {
          toast(t`Proposal created!`, {
            description: t`Reserve Optimistic Governor Upgrade proposal created`,
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
    <div
      data-testid="governance-optimistic-upgrade"
      className="sm:w-[408px] p-4 rounded-3xl bg-primary/10"
    >
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>New version available</Trans>
          </h4>
          <p className="text-sm">
            {isSharedVault ? (
              <Trans>
                <strong>Reserve Optimistic Governor upgrade</strong> moves this
                DTF to optimistic governance, voted with the shared vlRSR
                vote-lock vault. After it executes, voters lock RSR in the new
                vault to keep governing this DTF.
              </Trans>
            ) : (
              <Trans>
                <strong>Reserve Optimistic Governor upgrade</strong> moves this
                DTF to optimistic governance, voted with a new vote-lock vault.
                After it executes, voters lock their tokens in the new vault to
                keep governing this DTF.
              </Trans>
            )}
          </p>
        </div>
      </div>
      <Button
        data-testid="governance-optimistic-upgrade-btn"
        disabled={!isReady || isPending || isSubmitted}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose upgrade`}
      </Button>
    </div>
  )
}

export default function ProposeOptimisticGovernanceUpgrade() {
  const { isProposeAllowed } = useIsProposeAllowed()
  const proposals = useAtomValue(governanceProposalsAtom)
  const { isEligible } = useOptimisticUpgradeEligibility()
  const setRefetchToken = useSetAtom(refetchTokenAtom)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  if (!isProposeAllowed || !proposals) return null
  if (!isEligible || hasLiveUpgradeFolio(proposals)) return null

  const description = nextUpgradeFolioDescription(proposals)

  return <ProposeBanner refetch={refetch} description={description} />
}
