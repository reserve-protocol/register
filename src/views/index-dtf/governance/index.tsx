import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import { MigrationPreviewCard } from '@/components/vote-lock/migration-preview/migration-preview-card'
import {
  migrationPreviewTargetKeyForRoute,
  useMigrationPreviewMode,
  useMigrationPreviewStep,
} from '@/components/vote-lock/migration-preview/preview-state'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import GovernanceAccountInfo from './components/governance-account-info'
import GovernanceDelegateList from './components/governance-delegate-list'
import GovernanceProposalList from './components/governance-proposal-list'
import GovernanceRoles from './components/governance-roles'
import GovernanceStats from './components/governance-stats'
import GovernanceVoteLock from './components/governance-vote-lock'

// Updater lives in the main container!
const IndexDTFGovernance = () => {
  useTrackIndexDTFPage('governance')
  const dtf = useAtomValue(indexDTFAtom)
  const { chain, tokenId } = useParams()
  const migrationPreview = useMigrationPreviewMode()
  const [previewConnected, setPreviewConnected] = useState(false)
  const targetKey = migrationPreviewTargetKeyForRoute(chain, tokenId)
  const [migrationStep] = useMigrationPreviewStep(targetKey)
  const isMigrationInProgress =
    (migrationPreview === 'affected' ||
      (migrationPreview === 'disconnected' && previewConnected)) &&
    migrationStep < 3

  return (
    <div
      data-testid="dtf-governance"
      className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2 lg:pr-2 lg:pb-4"
    >
      <div className={migrationPreview ? 'min-w-0 lg:order-1' : 'min-w-0'}>
        <GovernanceProposalList />
      </div>
      <div
        className={`flex flex-col gap-1 p-1 bg-muted rounded-4xl h-fit ${migrationPreview ? 'order-first lg:order-2' : ''}`}
      >
        {migrationPreview && (
          <MigrationPreviewCard
            mode={migrationPreview}
            targetKey={targetKey}
            tokenSymbol={dtf?.stToken?.underlying.symbol ?? 'RSR'}
            voteLockSymbol={dtf?.stToken?.token.symbol}
            hideWhenComplete
            onPreviewConnect={() => setPreviewConnected(true)}
          />
        )}
        {!isMigrationInProgress && <GovernanceVoteLock />}
        <GovernanceAccountInfo />
        <GovernanceStats />
        <GovernanceRoles />
        <GovernanceDelegateList />
      </div>
    </div>
  )
}

export default IndexDTFGovernance
