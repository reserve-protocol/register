import {
  MigrationCard,
  MigrationConnectPrompt,
} from '@/components/vote-lock/migration/migration-card'
import { useVoteLockMigrations } from '@/components/vote-lock/migration/use-vote-lock-migrations'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { getMigrationVault, getOldVoteLocks } from './governance-migration'

// The DTF's retired per-DTF vote-locks, each moving into vlRSR or the DTF's own successor vault.
export const useDtfVoteLockMigration = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)
  const chainId = dtf?.chainId
  const candidates = useMemo(
    () =>
      dtf && chainId
        ? getOldVoteLocks(dtf, chainId).flatMap(({ address }) => {
            const vault = getMigrationVault(chainId, address)
            return vault
              ? [{ chainId, oldVoteLock: address, newVoteLock: vault.address, shared: vault.shared }]
              : []
          })
        : [],
    [dtf, chainId]
  )
  const { migrations, hasRetiredVoteLock, retiredNewSymbol } = useVoteLockMigrations(candidates, account)
  const migration = migrations[0]

  return {
    migration,
    // Shown in place of the regular vote-lock action until the holder dismisses the completion.
    isActive: !!migration && !migration.record.acknowledged,
    showConnectPrompt: !account && hasRetiredVoteLock,
    retiredNewSymbol,
  }
}

const DtfVoteLockMigration = ({
  page,
  allowConnectPrompt = false,
  className,
}: {
  page: string
  allowConnectPrompt?: boolean
  className?: string
}) => {
  const { migration, showConnectPrompt, retiredNewSymbol } = useDtfVoteLockMigration()

  if (migration) return <MigrationCard migration={migration} page={page} className={className} />
  if (allowConnectPrompt && showConnectPrompt) {
    return (
      <MigrationConnectPrompt page={page} vault={retiredNewSymbol || undefined} className={className} />
    )
  }
  return null
}

export default DtfVoteLockMigration
