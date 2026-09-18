import { Trans, useLingui } from '@lingui/react/macro'
import { PackageOpen, SearchX } from 'lucide-react'

import { Button } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
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
      <div className="space-y-6">
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

        <DocumentationSpecimenGrid className="xl:grid-cols-3">
          <DocumentationSpecimenCell
            label={<Trans>Compact full message</Trans>}
          >
            <InlineMessage density="compact" tone="warning">
              <InlineMessageDescription>
                <Trans>
                  This DTF contains assets with relatively low liquidity.
                </Trans>
              </InlineMessageDescription>
            </InlineMessage>
          </DocumentationSpecimenCell>
          <DocumentationSpecimenCell label={<Trans>Compact summary</Trans>}>
            <InlineMessage
              density="compact"
              presentation="summary"
              tone="warning"
            >
              <InlineMessageTitle>
                <Trans>Trading paused</Trans>
              </InlineMessageTitle>
              <HelpTooltip
                accessibleLabel={t`About the trading pause`}
                content={t`Some basket assets are outside trading hours.`}
              />
            </InlineMessage>
          </DocumentationSpecimenCell>
          <DocumentationSpecimenCell
            label={<Trans>Contained icon · trailing action</Trans>}
          >
            <InlineMessage
              iconPresentation="contained"
              presentation="summary"
              tone="information"
            >
              <InlineMessageTitle>
                <Trans>Alternative route available</Trans>
              </InlineMessageTitle>
              <Button className="ml-auto shrink-0" size="compact">
                <Trans>View route</Trans>
              </Button>
            </InlineMessage>
          </DocumentationSpecimenCell>
        </DocumentationSpecimenGrid>
      </div>
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
      <DocumentationSpecimenGrid className="xl:grid-cols-3">
        <DocumentationSpecimenCell label={<Trans>Metric</Trans>}>
          <div
            className="w-full max-w-sm space-y-3"
            aria-label={t`Loading metric`}
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-36" />
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
        <DocumentationSpecimenCell label={<Trans>Repeated records</Trans>}>
          <div
            className="w-full max-w-sm space-y-3"
            aria-label={t`Loading records`}
          >
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4"
              >
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'empty-state') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Quiet absence</Trans>}>
          <EmptyState
            className="min-h-36"
            title={<Trans>No activity yet</Trans>}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Actionable absence</Trans>}>
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
        <DocumentationSpecimenCell
          label={<Trans>First-use action</Trans>}
          className="sm:col-span-2"
        >
          <EmptyState
            className="min-h-44"
            mode="actionable"
            icon={<PackageOpen />}
            title={<Trans>No tokens in basket</Trans>}
            description={
              <Trans>
                Add the tokens that will compose the basket at launch.
              </Trans>
            }
            actions={
              <Button size="compact">
                <Trans>Add token</Trans>
              </Button>
            }
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}
