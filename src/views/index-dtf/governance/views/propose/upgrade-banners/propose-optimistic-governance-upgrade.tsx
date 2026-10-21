import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom, isSafeMultisigAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { trackClick } from '@/hooks/useTrackPage'
import { getCurrentTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { encodeFunctionData, getAddress, Hex, pad } from 'viem'
import { useSendCalls, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { toast } from 'sonner'
import {
  getGovernanceUpgradeTarget,
  optimisticStakingVaultAddress,
} from '@/components/vote-lock/migration/migration-targets'
import { useOptimisticUpgradeEligibility } from '@/views/index-dtf/components/vote-lock-migration/use-upgrade-eligibility'
import {
  buildRetireProposal,
  hasLiveUpgradeFolio,
  nextUpgradeFolioDescription,
} from './migration-proposals'
import { type RetirableVoteLock, useRetirableVoteLock } from './use-retirable-vote-lock'

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
  // Set for legacy DTFs whose old vault DAO can retire it: the CTA proposes the upgrade and the retirement together.
  retire?: RetirableVoteLock
  onPairChange: (inFlight: boolean) => void
}

const ProposeBanner = ({ refetch, description, retire, onPairChange }: SpellUpgradeProps) => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isSafe = useAtomValue(isSafeMultisigAtom)
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

  const retireWrite = useWriteContract()
  const { data: retireReceipt, error: retireReceiptError } =
    useWaitForTransactionReceipt({ hash: retireWrite.data, chainId })
  const isRetireConfirming =
    !!retireWrite.data && !retireReceipt && !retireReceiptError
  const { sendCalls, isPending: isBatching } = useSendCalls()
  const pairStarted = useRef(false)
  const retireRequested = useRef(false)

  const retireGovernor = retire?.voteLock.governance
  const retireVault = retire?.voteLock.address
  const retireSpell = retire?.spell
  const retireDescription = retire?.description
  const retireCall = useMemo(
    () =>
      retireGovernor && retireVault && retireSpell && retireDescription
        ? buildRetireProposal({
            chainId,
            governor: retireGovernor,
            voteLock: retireVault,
            spell: retireSpell,
            description: retireDescription,
          })
        : undefined,
    [chainId, retireDescription, retireGovernor, retireSpell, retireVault]
  )
  const handledRetire = useRef<Hex>()

  const isReady =
    dtf?.id &&
    dtf?.proxyAdmin &&
    dtf?.ownerGovernance?.id &&
    dtf?.tradingGovernance?.id
  const proposalAvailable = !!spell

  const buildUpgradeCall = () => {
    if (
      !dtf ||
      !target ||
      !spell ||
      !dtf.ownerGovernance ||
      !dtf.tradingGovernance
    )
      return undefined

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

    return {
      chainId,
      address: dtf.ownerGovernance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose' as const,
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
      ] as const,
    }
  }

  const endPair = useCallback(() => {
    pairStarted.current = false
    onPairChange(false)
    refetch()
  }, [onPairChange, refetch])

  const handlePropose = () => {
    const upgradeCall = buildUpgradeCall()
    if (!dtf || !upgradeCall) return

    trackClick(
      'governance',
      retireCall ? 'propose_governance_upgrade_and_retire' : 'propose_governance_upgrade',
      dtf.id,
      dtf.token.symbol,
      chainId
    )
    // A Safe executes both proposals in one batch; it never returns a mined hash to chain the second on.
    if (retireCall && isSafe) {
      sendCalls(
        {
          chainId,
          calls: [upgradeCall, retireCall].map((call) => ({
            to: call.address,
            data: encodeFunctionData({
              abi: DTFIndexGovernance,
              functionName: 'propose',
              args: call.args,
            }),
          })),
        },
        {
          onSuccess: () => {
            toast(t`Proposals sent to your Safe`, {
              description: t`Both proposals are created once the Safe transaction executes.`,
            })
            setTimeout(refetch, 10000)
          },
        }
      )
      return
    }
    if (retireCall) {
      pairStarted.current = true
      retireRequested.current = false
      onPairChange(true)
    }
    writeContract(upgradeCall, {
      onError: () => {
        if (pairStarted.current) endPair()
      },
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

    if (pairStarted.current && !retireRequested.current) {
      retireRequested.current = true
      if (retireCall) retireWrite.writeContract(retireCall, { onError: endPair })
      else endPair()
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.ownerGovernance.id,
      onSuccess: () => {
        toast(t`Proposal created!`, {
          description: t`Reserve Optimistic Governor Upgrade proposal created`,
          icon: '🎉',
        })
        if (!pairStarted.current) refetch()
      },
      onFallback: () => {
        setTimeout(() => {
          toast(t`Proposal created!`, {
            description: t`Reserve Optimistic Governor Upgrade proposal created`,
            icon: '🎉',
          })
          if (!pairStarted.current) refetch()
        }, 10000)
      },
    })
  }, [
    dtf?.ownerGovernance?.id,
    endPair,
    handleRecentProposalReceipt,
    isSuccess,
    receipt,
    refetch,
    retireCall,
    retireWrite,
    t,
  ])

  useEffect(() => {
    const sent = retireWrite.data
    if (!sent || !retireGovernor || handledRetire.current === sent) return
    if (!retireReceipt && !retireReceiptError) return
    handledRetire.current = sent
    if (retireReceipt?.status !== 'success') {
      endPair()
      return
    }
    void handleRecentProposalReceipt({
      receipt: retireReceipt,
      governor: retireGovernor,
      onSuccess: () => {
        toast(t`Proposal created!`, {
          description: t`Legacy vote-lock vault retirement proposal created`,
          icon: '🎉',
        })
        endPair()
      },
      onFallback: () => setTimeout(endPair, 10000),
    })
  }, [
    endPair,
    handleRecentProposalReceipt,
    retireGovernor,
    retireReceipt,
    retireReceiptError,
    retireWrite.data,
    t,
  ])

  if (!proposalAvailable) {
    return null
  }

  const isBusy =
    isPending ||
    isSubmitted ||
    isBatching ||
    retireWrite.isPending ||
    isRetireConfirming
  const label = retireWrite.isPending
    ? t`Sign the retirement proposal in wallet...`
    : isPending || isBatching
      ? retireCall && !isSafe
        ? t`Sign the upgrade proposal in wallet...`
        : t`Pending, sign in wallet...`
      : isSubmitted || isRetireConfirming
        ? t`Waiting for confirmation...`
        : retireCall
          ? t`Propose upgrade and vault retirement`
          : t`Propose upgrade`

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
          {retireCall && (
            <p className="text-sm mt-2" data-testid="governance-optimistic-upgrade-pair">
              {isSafe ? (
                <Trans>
                  It also proposes the old vault's retirement to its DAO, so
                  both votes run at the same time. Your Safe signs both in one
                  transaction.
                </Trans>
              ) : (
                <Trans>
                  It also proposes the old vault's retirement to its DAO, so
                  both votes run at the same time. You sign two proposals.
                </Trans>
              )}
            </p>
          )}
        </div>
      </div>
      <Button
        data-testid="governance-optimistic-upgrade-btn"
        disabled={!isReady || isBusy}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {isBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {label}
      </Button>
    </div>
  )
}

export default function ProposeOptimisticGovernanceUpgrade() {
  const { isProposeAllowed } = useIsProposeAllowed()
  const proposals = useAtomValue(governanceProposalsAtom)
  const { isEligible } = useOptimisticUpgradeEligibility()
  const retire = useRetirableVoteLock()
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  // The banner stays mounted between the two signatures, while the first proposal already counts as live.
  const [pairInFlight, setPairInFlight] = useState(false)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  if (!isProposeAllowed || !proposals) return null
  if (!pairInFlight && (!isEligible || hasLiveUpgradeFolio(proposals))) return null

  const canPair =
    !!retire &&
    retire.isProposeAllowed &&
    !retire.isLive &&
    retire.othersPending.length === 0

  return (
    <ProposeBanner
      refetch={refetch}
      description={nextUpgradeFolioDescription(proposals)}
      retire={canPair ? retire : undefined}
      onPairChange={setPairInFlight}
    />
  )
}
