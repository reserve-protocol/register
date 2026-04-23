import TokenLogo from '@/components/token-logo'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Hash } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from '@/views/index-dtf/governance/governance-helpers'
import useOptimisticGovernance from '../use-optimistic-governance'
import { shortenAddress } from '@/utils'
import { Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

const GovernanceTokenInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const governance = getDTFSettingsGovernance(indexDTF)
  const { isOptimisticGovernance } = useOptimisticGovernance(indexDTF)
  const governanceToken = governance?.token?.token ?? indexDTF?.stToken?.token
  const governanceTokenAddress = getGovernanceVoteTokenAddress(
    governance,
    indexDTF?.stToken?.id
  )
  const isVoteLockToken =
    !!indexDTF?.stToken?.id &&
    governanceTokenAddress?.toLowerCase() === indexDTF.stToken.id.toLowerCase()
  const isStakingVault = isVoteLockToken || isOptimisticGovernance
  const shouldReadUnderlying = isStakingVault && !indexDTF?.stToken?.underlying

  const { data: underlyingAddress } = useReadContract({
    address: governanceTokenAddress as Address | undefined,
    abi: dtfIndexStakingVault,
    functionName: 'asset',
    chainId,
    query: {
      enabled: !!governanceTokenAddress && shouldReadUnderlying,
    },
  })

  const { data: underlyingSymbol } = useReadContract({
    address: underlyingAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId,
    query: {
      enabled: !!underlyingAddress,
    },
  })

  const underlyingToken = indexDTF?.stToken?.underlying ??
    (underlyingAddress && underlyingSymbol
      ? {
          address: underlyingAddress,
          symbol: underlyingSymbol,
        }
      : undefined)

  if (!governanceToken || !governanceTokenAddress) return null

  return (
    <InfoCard title="Governance Token" id="governance-token">
      <InfoCardItem
        label={isStakingVault ? 'StakingVault' : 'Governance Token'}
        icon={<IconWrapper Component={Hash} />}
        value={
          isStakingVault ? (
            <span className="inline-flex flex-col">
              <span>{governanceToken.symbol}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {shortenAddress(governanceTokenAddress)}
              </span>
            </span>
          ) : (
            governanceToken.symbol
          )
        }
        address={governanceTokenAddress}
        border={false}
      />
      {isStakingVault && underlyingToken && (
        <InfoCardItem
          label="Underlying Token"
          icon={
            <TokenLogo
              chain={chainId}
              symbol={underlyingToken.symbol}
              address={underlyingToken.address}
              size="xl"
            />
          }
          value={underlyingToken.symbol}
          address={underlyingToken.address}
        />
      )}
    </InfoCard>
  )
}

export default GovernanceTokenInfo
