import { useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { Switch } from '@/components/design-system-v1/switch'
import { Skeleton } from '@/components/design-system-v1/loading'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/design-system-v1/select'
import { cn } from '@/lib/utils'
import {
  CURRENT_PROPOSAL_FIXTURES,
  HISTORICAL_PROPOSAL_FIXTURES,
  type GovernanceProposalFixture,
} from './governance-proposal-state-fixtures'
import { GovernanceProposalRecord } from './governance-proposal-record'

const GovernanceProposalStateReview = ({
  reviewScope,
}: {
  reviewScope: React.ReactNode
}) => {
  const { t } = useLingui()
  const [constrained, setConstrained] = useState(false)
  const [preview, setPreview] = useState('default')
  return (
    <section
      aria-labelledby="proposal-record-review-title"
      className={v1LayoutRecipes.stack.internalRegions}
    >
      <div className={v1LayoutRecipes.stack.tightText}>
        <h3
          id="proposal-record-review-title"
          className="text-sm font-medium text-foreground"
        >
          Governance proposal records
        </h3>
        <p className="max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          Real proposal behavior is mapped across standard, fast optimistic, and
          contested flows. Titles preserve real product density; fixtures
          simulate state branches that are not simultaneously available in local
          data.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
          <Switch checked={constrained} onCheckedChange={setConstrained} />
          <Trans>Constrained proposal column</Trans>
        </label>
        <Select value={preview} onValueChange={setPreview}>
          <SelectTrigger
            data-testid="governance-preview-state"
            aria-label={t`Preview state`}
            className="w-48"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="default"
              data-testid="governance-preview-default"
            >
              <Trans>Default</Trans>
            </SelectItem>
            <SelectItem
              value="loading"
              data-testid="governance-preview-loading"
            >
              <Trans>Loading</Trans>
            </SelectItem>
            <SelectItem value="empty" data-testid="governance-preview-empty">
              <Trans>Empty</Trans>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        className={cn(
          'grid items-start xl:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]',
          v1LayoutRecipes.cluster.internalRegions
        )}
      >
        <div
          className={cn(
            'min-w-0',
            constrained ? 'max-w-[390px]' : 'max-w-3xl',
            v1LayoutRecipes.stack.completeGroups
          )}
        >
          {preview === 'default' ? (
            <>
              <ProposalStateGroup
                title="Current and actionable"
                records={CURRENT_PROPOSAL_FIXTURES}
              />
              <ProposalStateGroup
                title="Historical and closed"
                records={HISTORICAL_PROPOSAL_FIXTURES}
              />
            </>
          ) : preview === 'loading' ? (
            <div
              data-testid="governance-loading"
              aria-busy="true"
              className="space-y-px bg-secondary"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-4 bg-card p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-2/3 rounded-full" />
                    <Skeleton className="h-1 w-full" />
                  </div>
                  <Skeleton className="h-10 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              data-testid="governance-empty"
              className="bg-card p-6 text-sm text-muted-foreground"
            >
              <Trans>No proposals found</Trans>
            </div>
          )}
        </div>
        {reviewScope}
      </div>
    </section>
  )
}

const ProposalStateGroup = ({
  title,
  records,
}: {
  title: string
  records: GovernanceProposalFixture[]
}) => (
  <div className={v1LayoutRecipes.stack.relatedContent}>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <div className="space-y-px bg-secondary">
      {records.map((record) => (
        <div key={record.state} className={roles.surface.content}>
          <GovernanceProposalRecord record={record} />
        </div>
      ))}
    </div>
  </div>
)

export default GovernanceProposalStateReview
