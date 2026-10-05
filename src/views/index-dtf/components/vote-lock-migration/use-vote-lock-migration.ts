import { walletAtom } from '@/state/atoms'
import type { IndexDTF } from '@/types'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { type Address, parseAbi } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import {
  getOldVoteLocks,
  optimisticStakingVaultAddress,
} from './governance-migration'
import { isRetiredWithBalance } from './migration-state'

export const legacyVaultAbi = parseAbi([
  'function owner() view returns (address)',
  'function unstakingDelay() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function asset() view returns (address)',
  'function symbol() view returns (string)',
])

const READS_PER_VAULT = 5

export type VoteLockMigration = {
  chainId: IndexDTF['chainId']
  account: Address
  oldVoteLock: Address
  oldSymbol: string
  shares: bigint
  underlying: Address
  newVoteLock: Address
  refetch: () => void
}

export const useVoteLockMigration = (): VoteLockMigration | undefined => {
  const dtf = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)
  const chainId = dtf?.chainId
  const voteLocks = dtf && chainId ? getOldVoteLocks(dtf, chainId) : []
  const newVoteLock = chainId ? optimisticStakingVaultAddress[chainId] : undefined
  const { data, refetch } = useReadContracts({
    contracts: voteLocks.flatMap(({ address }) =>
      (['owner', 'unstakingDelay', 'balanceOf', 'asset', 'symbol'] as const).map(
        (functionName) => ({
          address,
          abi: legacyVaultAbi,
          functionName,
          chainId,
          ...(functionName === 'balanceOf' ? { args: [account] } : {}),
        })
      )
    ),
    query: { enabled: !!account && voteLocks.length > 0 },
  })
  const { data: newUnderlying } = useReadContract({
    address: newVoteLock,
    abi: legacyVaultAbi,
    functionName: 'asset',
    chainId,
    query: { enabled: !!account && !!newVoteLock && voteLocks.length > 0 },
  })

  if (!account || !chainId || !data || !newVoteLock || !newUnderlying)
    return undefined

  // Only same-asset vaults can move: redeeming a non-RSR vault pays out a token vlRSR does not accept.
  const index = voteLocks.findIndex((_, i) => {
    const [owner, unstakingDelay, shares, underlying] = data.slice(
      i * READS_PER_VAULT,
      i * READS_PER_VAULT + 4
    )
    return (
      underlying?.result === newUnderlying &&
      isRetiredWithBalance({
      owner: owner?.result as string | undefined,
      unstakingDelay: unstakingDelay?.result as bigint | undefined,
        shares: shares?.result as bigint | undefined,
      })
    )
  })
  if (index < 0) return undefined

  const [, , shares, underlying, symbol] = data
    .slice(index * READS_PER_VAULT, (index + 1) * READS_PER_VAULT)
    .map(({ result }) => result)

  return {
    chainId,
    account,
    oldVoteLock: voteLocks[index].address,
    oldSymbol: symbol as string,
    shares: shares as bigint,
    underlying: underlying as Address,
    newVoteLock,
    refetch: () => void refetch(),
  }
}
