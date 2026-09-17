import { Trans, useLingui } from '@lingui/react/macro'
import { SearchX } from 'lucide-react'

import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { Skeleton, Spinner } from '@/components/design-system-v1/loading'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const FeedbackComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'alert') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Information</Trans>}>
          <InlineMessage className="max-w-lg" tone="information">
            <InlineMessageTitle>
              <Trans>Review required</Trans>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <Trans>
                Check the updated governance settings before continuing.
              </Trans>
            </InlineMessageDescription>
          </InlineMessage>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Success</Trans>}>
          <InlineMessage className="max-w-lg" tone="success">
            <InlineMessageTitle>
              <Trans>Proposal submitted</Trans>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <Trans>The proposal is now available for review.</Trans>
            </InlineMessageDescription>
          </InlineMessage>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Warning</Trans>}>
          <InlineMessage className="max-w-lg" tone="warning">
            <InlineMessageTitle>
              <Trans>Action required</Trans>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <Trans>Confirm the network before continuing.</Trans>
            </InlineMessageDescription>
          </InlineMessage>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Danger</Trans>}>
          <InlineMessage className="max-w-lg" tone="danger">
            <InlineMessageTitle>
              <Trans>Transaction failed</Trans>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <Trans>No changes were made.</Trans>
            </InlineMessageDescription>
          </InlineMessage>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'spinner') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label="14px">
          <Spinner label={t`Loading compact result`} size={14} />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label="16px">
          <Spinner label={t`Loading`} size={16} />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label="24px">
          <Spinner label={t`Loading page`} size={24} />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'skeleton') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Text and control</Trans>}>
          <div
            className="w-full max-w-sm space-y-3"
            aria-label={t`Loading preview`}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Identity row</Trans>}>
          <div
            className="flex items-center gap-3"
            aria-label={t`Loading identity`}
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'empty-state') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Quiet</Trans>}>
          <EmptyState
            className="min-h-36"
            icon={<SearchX />}
            title={<Trans>No activity yet</Trans>}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Actionable</Trans>}>
          <EmptyState
            className="min-h-36"
            mode="actionable"
            icon={<SearchX />}
            title={<Trans>No results found</Trans>}
            description={<Trans>Try changing or clearing your filters.</Trans>}
            actions={
              <Button size="compact" tone="secondary">
                <Trans>Clear filters</Trans>
              </Button>
            }
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}
