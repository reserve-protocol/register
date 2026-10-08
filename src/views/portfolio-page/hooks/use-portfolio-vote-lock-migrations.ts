import { listMigrationTargets } from '@/components/vote-lock/migration/migration-record'
import { useMigrationRecordsVersion } from '@/components/vote-lock/migration/use-migration-record'
import {
  useVoteLockMigrations,
  type VoteLockMigration,
} from '@/components/vote-lock/migration/use-vote-lock-migrations'
import { walletAtom } from '@/state/atoms'
import { optimisticStakingVaultAddress } from '@/views/index-dtf/components/vote-lock-migration/governance-migration'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { portfolioAddressAtom, portfolioVoteLocksAtom } from '../atoms'

export const migrationKey = (chainId: number, oldVoteLock: Address) =>
  `${chainId}:${oldVoteLock.toLowerCase()}`

// Migrations for the connected wallet's own portfolio; viewing another account offers none.
export const usePortfolioVoteLockMigrations = () => {
  const wallet = useAtomValue(walletAtom)
  const portfolioAddress = useAtomValue(portfolioAddressAtom)
  const voteLocks = useAtomValue(portfolioVoteLocksAtom)
  const recordsVersion = useMigrationRecordsVersion()
  const isOwn = !!wallet && !!portfolioAddress && isAddressEqual(wallet, portfolioAddress)

  const candidates = useMemo(() => {
    if (!isOwn || !wallet) return []
    const seen = new Set<string>()
    const vaults = [
      ...voteLocks
        .filter((v) => Number(v.amount) > 0)
        .map((v) => ({ chainId: v.chainId, oldVoteLock: v.stTokenAddress })),
      // A redeemed position leaves the portfolio response; its record keeps the migration visible.
      ...listMigrationTargets(wallet),
    ]
    return vaults.flatMap(({ chainId, oldVoteLock }) => {
      const newVoteLock = optimisticStakingVaultAddress[chainId]
      const key = migrationKey(chainId, oldVoteLock)
      if (!newVoteLock || isAddressEqual(newVoteLock, oldVoteLock) || seen.has(key)) return []
      seen.add(key)
      return [{ chainId, oldVoteLock, newVoteLock }]
    })
    // recordsVersion re-reads the stored targets after a migration starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwn, wallet, voteLocks, recordsVersion])

  const { migrations } = useVoteLockMigrations(candidates, isOwn ? wallet : undefined)
  const active = migrations.filter((m) => !m.record.acknowledged)
  const byKey = useMemo(
    () =>
      new Map<string, VoteLockMigration>(
        active.map((m) => [migrationKey(m.chainId, m.oldVoteLock), m])
      ),
    [active]
  )
  return { migrations: active, byKey }
}
