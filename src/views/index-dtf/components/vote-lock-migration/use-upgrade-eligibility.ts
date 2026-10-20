import {
  indexDTFAtom,
  indexDTFStatusAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { parseAbi } from 'viem'
import { useReadContract } from 'wagmi'
import {
  getGovernanceUpgradeTarget,
  isOptimisticGovernanceUpgradeEligible,
} from './governance-migration'

const versionAbi = parseAbi(['function version() view returns (string)'])

export const useOptimisticUpgradeEligibility = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const folioVersion = useAtomValue(indexDTFVersionAtom)
  const chainId = dtf?.chainId
  const target =
    dtf && chainId ? getGovernanceUpgradeTarget(chainId, dtf.id) : undefined
  const { data: stakingVaultVersion } = useReadContract({
    address: target?.stakingVault,
    abi: versionAbi,
    functionName: 'version',
    chainId,
    query: { enabled: !!target },
  })

  const isEligible =
    !!dtf &&
    !!chainId &&
    isOptimisticGovernanceUpgradeEligible({
      chainId,
      dtfAddress: dtf.id,
      status,
      folioVersion,
      ownerGovernor: dtf.ownerGovernance?.id,
      tradingGovernor: dtf.tradingGovernance?.id,
      stakingVaultVersion,
      ownerTimelock: dtf.ownerGovernance?.timelock.id,
      tradingTimelock: dtf.tradingGovernance?.timelock.id,
      oldVoteLock: dtf.stToken?.id,
      oldVoteLockUnderlying: dtf.stToken?.underlying.address,
      admins: dtf.roles.admin.all,
      auctionApprovers: dtf.auctionApprovers,
      auctionLaunchers: dtf.auctionLaunchers,
      brandManagers: dtf.brandManagers,
      feeRecipients: dtf.feeRecipients.map(({ address }) => address),
    })

  return { target: isEligible ? target : undefined, isEligible }
}
