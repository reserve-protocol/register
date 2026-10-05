import { Button } from '@/components/ui/button'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { ArrowRightLeft } from 'lucide-react'
import { useState } from 'react'
import {
  useVoteLockMigration,
  type VoteLockMigration,
} from './use-vote-lock-migration'
import VoteLockMigrationModal from './vote-lock-migration-modal'

const VoteLockMigrationBanner = ({ subpage }: { subpage: string }) => {
  const migration = useVoteLockMigration()
  // The redeem zeroes the old balance; the modal keeps the snapshot (and its progress) until the migration finishes.
  const [active, setActive] = useState<VoteLockMigration>()
  const [open, setOpen] = useState(false)
  const { trackClick } = useTrackIndexDTFClick('overview', subpage)
  const shown = active ?? migration

  if (!shown) return null

  return (
    <>
      <div
        data-testid="vote-lock-migration-banner"
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-3xl bg-primary/10"
      >
        <ArrowRightLeft size={24} className="text-primary shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-primary">
            <Trans>Move your vote-lock to vlRSR</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              This DTF now votes with the shared vlRSR vault. Your{' '}
              {shown.oldSymbol} can move over in three transactions.
            </Trans>
          </p>
        </div>
        <Button
          data-testid="vote-lock-migration-open-btn"
          onClick={() => {
            trackClick('vote_lock_migration_open')
            setActive(shown)
            setOpen(true)
          }}
        >
          <Trans>Migrate</Trans>
        </Button>
      </div>
      {active && (
        <VoteLockMigrationModal
          migration={active}
          open={open}
          onOpenChange={setOpen}
          onFinished={() => {
            setOpen(false)
            setActive(undefined)
          }}
          subpage={subpage}
        />
      )}
    </>
  )
}

export default VoteLockMigrationBanner
