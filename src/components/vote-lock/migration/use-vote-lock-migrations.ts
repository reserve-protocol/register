import { useMemo } from 'react'
import { erc20Abi, parseAbi, type Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { readMigrationRecord, type MigrationRecord } from './migration-record'
import { isRetired } from './migration-state'
import { useMigrationRecordsVersion } from './use-migration-record'

export const legacyVaultAbi = parseAbi([
  'function owner() view returns (address)',
  'function unstakingDelay() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function asset() view returns (address)',
  'function symbol() view returns (string)',
  'function delegates(address) view returns (address)',
  'function previewRedeem(uint256) view returns (uint256)',
])

export type MigrationCandidate = {
  chainId: number
  oldVoteLock: Address
  newVoteLock: Address
  // True for the chain's shared vlRSR; false for a DTF's own successor vault.
  shared: boolean
}

export type VoteLockMigration = MigrationCandidate & {
  account: Address
  oldSymbol: string
  newSymbol: string
  underlyingSymbol: string
  shares: bigint
  underlying: Address
  record: MigrationRecord
  refetch: () => void
}

const OLD_READS = ['owner', 'unstakingDelay', 'asset', 'symbol'] as const

// A retired old vault (renounced owner, zero delay) backed by the same asset as its new vault.
export const useVoteLockMigrations = (
  candidates: MigrationCandidate[],
  account: Address | undefined | null
) => {
  useMigrationRecordsVersion()
  const contracts = useMemo(
    () =>
      candidates.flatMap(({ chainId, oldVoteLock, newVoteLock }) => [
        ...OLD_READS.map((functionName) => ({
          address: oldVoteLock,
          abi: legacyVaultAbi,
          functionName,
          chainId,
        })),
        {
          address: oldVoteLock,
          abi: legacyVaultAbi,
          functionName: 'balanceOf' as const,
          args: [account ?? oldVoteLock] as const,
          chainId,
        },
        { address: newVoteLock, abi: legacyVaultAbi, functionName: 'asset' as const, chainId },
        { address: newVoteLock, abi: legacyVaultAbi, functionName: 'symbol' as const, chainId },
      ]),
    [candidates, account]
  )
  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: candidates.length > 0 },
  })
  const per = OLD_READS.length + 3

  const vaults = candidates.map((candidate, index) => {
    const reads = data?.slice(index * per, (index + 1) * per).map((r) => r.result)
    const [owner, unstakingDelay, asset, symbol, balance, newAsset, newSymbol] = reads ?? []
    const sameAsset =
      !!asset &&
      !!newAsset &&
      (asset as string).toLowerCase() === (newAsset as string).toLowerCase()
    return {
      candidate,
      retired:
        sameAsset &&
        isRetired({
          owner: owner as string | undefined,
          unstakingDelay: unstakingDelay as bigint | undefined,
        }),
      shares: account ? ((balance as bigint | undefined) ?? 0n) : 0n,
      underlying: asset as Address | undefined,
      symbol: (symbol as string | undefined) ?? '',
      newSymbol: (newSymbol as string | undefined) ?? '',
    }
  })

  const underlyings = vaults.flatMap(({ candidate, underlying }) =>
    underlying ? [{ chainId: candidate.chainId, underlying }] : []
  )
  const { data: underlyingSymbols } = useReadContracts({
    contracts: underlyings.map(({ chainId, underlying }) => ({
      address: underlying,
      abi: erc20Abi,
      functionName: 'symbol' as const,
      chainId,
    })),
    query: { enabled: underlyings.length > 0 },
  })
  const underlyingSymbolOf = (chainId: number, underlying: Address) => {
    const index = underlyings.findIndex(
      (u) => u.chainId === chainId && u.underlying.toLowerCase() === underlying.toLowerCase()
    )
    return (underlyingSymbols?.[index]?.result as string | undefined) ?? ''
  }

  const migrations: VoteLockMigration[] = account
    ? vaults.flatMap(({ candidate, retired, shares, underlying, symbol, newSymbol }) => {
        if (!retired || !underlying) return []
        const record = readMigrationRecord({ ...candidate, account })
        // A redeemed position has no old shares left; its record carries it until the holder dismisses completion.
        const inProgress = !!record.redeem && !record.acknowledged
        if (shares === 0n && !inProgress) return []
        return [
          {
            ...candidate,
            account,
            oldSymbol: symbol,
            newSymbol,
            underlyingSymbol: underlyingSymbolOf(candidate.chainId, underlying),
            shares,
            underlying,
            record,
            refetch: () => void refetch(),
          },
        ]
      })
    : []

  return {
    migrations,
    hasRetiredVoteLock: vaults.some((vault) => vault.retired),
    retiredNewSymbol: vaults.find((vault) => vault.retired)?.newSymbol ?? '',
    isLoading,
    refetch: () => void refetch(),
  }
}
