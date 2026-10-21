import {
  getGovernanceUpgradeTarget,
  optimisticStakingVaultAddress,
} from '@/components/vote-lock/migration/migration-targets'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import {
  getOldVoteLocks,
  type OldVoteLock,
} from '@/views/index-dtf/components/vote-lock-migration/governance-migration'
import { useIndexDtfVoteLockDependents } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { type Address, isAddressEqual, parseAbi, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { governanceProposalsAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import {
  hasLiveRetire,
  nextRetireDescription,
  ownableVaultAbi,
} from './migration-proposals'

const governorTimelockAbi = parseAbi(['function timelock() view returns (address)'])
// The DTF's old vault when its DAO can retire it: a vault in the target's token still owned by the DAO timelock.
export const useRetirableVoteLock = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const chainId = useAtomValue(chainIdAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  const candidates = dtf
    ? getOldVoteLocks(dtf, chainId).filter(
        (candidate): candidate is Required<OldVoteLock> => !!candidate.governance
      )
    : []
  const { data: ownership } = useReadContracts({
    contracts: candidates.flatMap(({ address, governance }) => [
      { address, abi: ownableVaultAbi, functionName: 'owner', chainId },
      { address, abi: ownableVaultAbi, functionName: 'asset', chainId },
      { address: governance, abi: governorTimelockAbi, functionName: 'timelock', chainId },
    ]),
    query: { enabled: candidates.length > 0 },
  })
  const target = dtf ? getGovernanceUpgradeTarget(chainId, dtf.id) : undefined
  const underlying = target?.stakingVaultUnderlying
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
      !!underlying &&
      isAddressEqual(asset, underlying)
    )
  })
  const { isProposeAllowed } = useIsProposeAllowed(voteLock?.governance)
  const { data: dependents } = useIndexDtfVoteLockDependents(
    dtf && voteLock ? { chainId: dtf.chainId, voteLock: voteLock.address } : undefined
  )

  if (status !== 'active' || !dtf || !target || !voteLock || !proposals || !dependents) {
    return undefined
  }

  const governed = dependents.filter(({ governedByVoteLock }) => governedByVoteLock)
  return {
    voteLock,
    spell: target.spell,
    shared: target.stakingVault === optimisticStakingVaultAddress[chainId],
    selfPending: governed.some(({ address }) => isAddressEqual(address, dtf.id)),
    othersPending: governed.filter(({ address }) => !isAddressEqual(address, dtf.id)),
    isProposeAllowed,
    isLive: hasLiveRetire(proposals, voteLock.address),
    description: nextRetireDescription(proposals, voteLock.address),
  }
}

export type RetirableVoteLock = NonNullable<ReturnType<typeof useRetirableVoteLock>>
