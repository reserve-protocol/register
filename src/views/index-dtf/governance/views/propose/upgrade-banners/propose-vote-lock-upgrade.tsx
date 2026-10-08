import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { keccak256, toHex, type Address } from 'viem'
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import {
  VOTE_LOCK_UPGRADE_TO,
  buildVoteLockUpgradeProposal,
  getVoteLockUpgradeEligibility,
  hasLiveVoteLockUpgrade,
  nextVoteLockUpgradeDescription,
  voteLockUpgradeAbi,
} from './vote-lock-upgrade'

const CHANGELOG_URL =
  'https://github.com/reserve-protocol/reserve-governor/releases/tag/r1.1.0'

// Everything the proposal encodes is read from chain: component versions, the vault's
// version registry and the implementations it registers for 1.1.0.
const useVoteLockUpgradeReads = (
  chainId: number | undefined,
  vault: Address | undefined,
  governor: Address | undefined
) => {
  const enabled = !!chainId && !!vault && !!governor
  const { data: base } = useReadContracts({
    contracts: [
      { address: vault, abi: voteLockUpgradeAbi, functionName: 'version', chainId },
      { address: vault, abi: voteLockUpgradeAbi, functionName: 'versionRegistry', chainId },
      { address: governor, abi: voteLockUpgradeAbi, functionName: 'version', chainId },
      { address: governor, abi: voteLockUpgradeAbi, functionName: 'timelock', chainId },
    ],
    query: { enabled },
  })
  const [vaultVersion, registry, governorVersion, timelock] = (base ?? []).map(
    (read) => (read.status === 'success' ? read.result : undefined)
  ) as [string?, Address?, string?, Address?]

  const { data: registryReads } = useReadContracts({
    contracts: [
      { address: timelock, abi: voteLockUpgradeAbi, functionName: 'version', chainId },
      { address: registry, abi: voteLockUpgradeAbi, functionName: 'getLatestVersion', chainId },
      {
        address: registry,
        abi: voteLockUpgradeAbi,
        functionName: 'getImplementationsForVersion',
        args: [keccak256(toHex(VOTE_LOCK_UPGRADE_TO))],
        chainId,
      },
    ],
    query: { enabled: enabled && !!registry && !!timelock },
  })
  const [timelockVersion, latest, implementations] = (registryReads ?? []).map(
    (read) => (read.status === 'success' ? read.result : undefined)
  ) as [
    string?,
    (readonly [`0x${string}`, string, Address, boolean])?,
    (readonly [Address, Address, Address])?,
  ]

  return {
    registry,
    timelock,
    reads: {
      versions: {
        vault: vaultVersion,
        governor: governorVersion,
        timelock: timelockVersion,
      },
      latest: latest && { version: latest[1], deprecated: latest[3] },
      implementations: implementations && {
        vault: implementations[0],
        governor: implementations[1],
        timelock: implementations[2],
      },
      governorTimelock: timelock,
      timelock,
    },
  }
}

export default function ProposeVoteLockUpgrade() {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const vault = dtf?.stToken?.id as Address | undefined
  const governor = dtf?.stToken?.governance?.id as Address | undefined
  const chainId = dtf?.chainId
  const { isProposeAllowed } = useIsProposeAllowed(governor)
  const { registry, timelock, reads } = useVoteLockUpgradeReads(
    chainId,
    vault,
    governor
  )

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt, isSuccess, error: receiptError } =
    useWaitForTransactionReceipt({ hash, chainId })
  const isSubmitted =
    (!!hash && !receipt && !receiptError) || receipt?.status === 'success'

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  useEffect(() => {
    if (!isSuccess || receipt?.status !== 'success' || !governor) return

    const notify = () => {
      toast(t`Proposal created!`, {
        description: t`Vote-lock 1.1.0 upgrade proposal created`,
        icon: '🎉',
      })
      refetch()
    }

    void handleRecentProposalReceipt({
      receipt,
      governor,
      onSuccess: notify,
      onFallback: () => setTimeout(notify, 10000),
    })
  }, [governor, handleRecentProposalReceipt, isSuccess, receipt, refetch, t])

  if (
    !dtf ||
    !chainId ||
    !vault ||
    !governor ||
    !registry ||
    !timelock ||
    !isProposeAllowed ||
    !proposals ||
    !getVoteLockUpgradeEligibility({ ...reads, chainId, vault }) ||
    hasLiveVoteLockUpgrade(proposals)
  ) {
    return null
  }

  const symbol = dtf.stToken?.token.symbol ?? ''

  const handlePropose = () => {
    const { vault: vaultImpl, governor: governorImpl, timelock: timelockImpl } =
      reads.implementations!
    writeContract(
      buildVoteLockUpgradeProposal({
        chainId,
        governor,
        vault,
        timelock,
        registry,
        implementations: {
          vault: vaultImpl!,
          governor: governorImpl!,
          timelock: timelockImpl!,
        },
        description: nextVoteLockUpgradeDescription(proposals),
      })
    )
  }

  return (
    <div
      data-testid="governance-vote-lock-upgrade"
      className="sm:w-[408px] p-4 rounded-3xl bg-primary/10"
    >
      <div className="flex flex-row items-center gap-2">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>{symbol} governance 1.1.0 available</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              Upgrades the {symbol} vault, its governor and timelock to release
              1.1.0. The proposal goes to the {symbol} DAO. See the{' '}
              <a
                className="text-primary underline"
                href={CHANGELOG_URL}
                target="_blank"
                rel="noreferrer"
              >
                changelog
              </a>{' '}
              for details.
            </Trans>
          </p>
        </div>
      </div>
      <Button
        data-testid="governance-vote-lock-upgrade-btn"
        disabled={isPending || isSubmitted}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose ${symbol} upgrade`}
      </Button>
    </div>
  )
}
