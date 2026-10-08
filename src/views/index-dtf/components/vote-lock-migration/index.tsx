import {
  MigrationCard,
  MigrationConnectPrompt,
} from '@/components/vote-lock/migration/migration-card'
import { useVoteLockMigrations } from '@/components/vote-lock/migration/use-vote-lock-migrations'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  getOldVoteLocks,
  optimisticStakingVaultAddress,
} from './governance-migration'

// The DTF's retired per-DTF vote-locks, each moving into the chain's shared vlRSR.
export const useDtfVoteLockMigration = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)
  const chainId = dtf?.chainId
  const newVoteLock = chainId ? optimisticStakingVaultAddress[chainId] : undefined
  const candidates = useMemo(
    () =>
      dtf && chainId && newVoteLock
        ? getOldVoteLocks(dtf, chainId).map(({ address }) => ({
            chainId,
            oldVoteLock: address,
            newVoteLock,
          }))
        : [],
    [dtf, chainId, newVoteLock]
  )
  const { migrations, hasRetiredVoteLock } = useVoteLockMigrations(candidates, account)
  const migration = migrations[0]

  return {
    migration,
    // Shown in place of the regular vote-lock action until the holder dismisses the completion.
    isActive: !!migration && !migration.record.acknowledged,
    showConnectPrompt: !account && hasRetiredVoteLock,
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
  const { migration, showConnectPrompt } = useDtfVoteLockMigration()

  if (migration) return <MigrationCard migration={migration} page={page} className={className} />
  if (allowConnectPrompt && showConnectPrompt) {
    return <MigrationConnectPrompt page={page} className={className} />
  }
  return null
}

export default DtfVoteLockMigration
