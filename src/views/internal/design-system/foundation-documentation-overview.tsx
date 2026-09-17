import { ArrowUpRight, CircleDashed } from 'lucide-react'
import { Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'react-router-dom'

import { PageHeader } from './catalog-ui'
import type { FoundationItem } from './catalog-types'
import { FOUNDATION_ITEMS } from './foundation-catalog'
import { getFoundationNameMessage } from './documentation-catalog-messages'
import { FoundationPrimaryResult } from './foundation-documentation-results'
import { DocumentationStatus } from './documentation-status'

const FoundationDocumentationOverview = () => {
  const { t } = useLingui()

  return (
    <div data-testid="foundations-overview" className="space-y-10">
      <PageHeader
        eyebrow={t`Canonical reference`}
        title={t`Foundations`}
        description={t`The current visual system in one continuous reference. Start with the result; open supporting detail only when you need it.`}
      />

      <nav
        aria-label={t`Foundation sections`}
        className="-mx-1 flex gap-1 overflow-x-auto border-y border-border px-1 py-2"
      >
        {FOUNDATION_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-testid={`foundation-anchor-${item.id}`}
            className="flex min-h-11 shrink-0 items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            {t(getFoundationNameMessage(item.id))}
          </a>
        ))}
      </nav>

      <div>
        {FOUNDATION_ITEMS.map((item, index) => (
          <FoundationReferenceSection
            key={item.id}
            item={item}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  )
}

const FoundationReferenceSection = ({
  isFirst,
  item,
}: {
  isFirst: boolean
  item: FoundationItem
}) => (
  <section
    id={item.id}
    data-testid="foundation-reference-section"
    data-foundation-authority={item.designAuthority}
    aria-labelledby={`${item.id}-heading`}
    className={`scroll-mt-28 py-12 ${isFirst ? '' : 'border-t border-border'}`}
  >
    <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id={`${item.id}-heading`}
            className="text-[32px] font-light leading-[38px] tracking-[-0.01em]"
          >
            <LocalizedFoundationName id={item.id} />
          </h2>
          <AuthorityPill item={item} />
        </div>
        <p className="mt-2 max-w-3xl text-base font-light leading-6">
          {item.description}
        </p>
        {item.designAuthority !== 'current-baseline' && (
          <p className="mt-3 flex max-w-3xl gap-2 text-sm font-light leading-5 text-muted-foreground">
            <CircleDashed className="mt-0.5 size-4 shrink-0" />
            <Trans>
              This section shows the current bounded direction; open decisions
              are not filled in as if they were settled.
            </Trans>
          </p>
        )}
      </div>
      <Link
        to={`/internal/design-system/foundations/${item.id}`}
        data-testid={`foundation-detail-link-${item.id}`}
        className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trans>
          Open supporting <LocalizedFoundationName id={item.id} /> detail
        </Trans>
        <ArrowUpRight className="size-4" />
      </Link>
    </header>

    <div data-testid="foundation-primary-result" className="mt-8">
      <FoundationPrimaryResult foundationId={item.id} />
    </div>

    <section className="mt-8" aria-labelledby={`${item.id}-rules-heading`}>
      <h3 id={`${item.id}-rules-heading`} className="text-xl font-light">
        <Trans>Governing rules</Trans>
      </h3>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {item.expectedDecisions.map((decision) => (
          <article
            key={decision.name}
            className="grid gap-2 py-4 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] md:gap-6"
          >
            <div className="flex items-start gap-2">
              <h4 className="text-sm font-medium leading-5">{decision.name}</h4>
              {decision.status === 'open' && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  <Trans>Open</Trans>
                </span>
              )}
            </div>
            <p className="text-sm font-light leading-5 text-muted-foreground">
              {decision.detail}
            </p>
          </article>
        ))}
      </div>
    </section>

    <details
      data-testid="foundation-secondary-details"
      className="group mt-6 border border-border bg-card"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <Trans>Authority, implementation, and history</Trans>
        <span className="text-xs font-light text-muted-foreground group-open:hidden">
          <Trans>Show</Trans>
        </span>
      </summary>
      <div className="grid gap-5 border-t border-border p-5 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium">
            <Trans>Why it matters</Trans>
          </h4>
          <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
            {item.why}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">
            <Trans>Current authority boundary</Trans>
          </h4>
          <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
            {item.statusDetail}
          </p>
        </div>
      </div>
    </details>
  </section>
)

const AuthorityPill = ({ item }: { item: FoundationItem }) => (
  <DocumentationStatus
    status={
      item.designAuthority === 'current-baseline' ? 'accepted' : 'exploring'
    }
  >
    {item.designAuthority === 'current-baseline' ? (
      <Trans>Accepted</Trans>
    ) : (
      <Trans>Exploring</Trans>
    )}
  </DocumentationStatus>
)

const LocalizedFoundationName = ({ id }: { id: string }) => {
  const { t } = useLingui()
  return t(getFoundationNameMessage(id))
}

export default FoundationDocumentationOverview
