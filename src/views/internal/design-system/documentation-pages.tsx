import { ArrowRight } from 'lucide-react'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'react-router-dom'
import { PageHeader } from './catalog-ui'
import { COMPONENT_ITEMS } from './component-catalog'
import { CURRENT_REVIEW } from './current-review'
import { getComponentNameMessage } from './documentation-catalog-messages'
import { FOUNDATION_ITEMS } from './foundation-catalog'
import {
  PATTERN_PRESENTATIONS,
  WORKBENCH_ACTIVITY,
  WORKBENCH_ACTIVITY_MESSAGES,
  getPatternSourceItem,
} from './documentation-presentation'
import PatternsDocumentationOverview from './documentation-patterns-overview'

const sectionLink =
  'group flex min-h-14 items-center justify-between gap-4 border-t border-border py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const DocumentationStartPage = () => {
  const { t } = useLingui()

  return (
    <div data-testid="documentation-start" className="space-y-10">
      <PageHeader
        eyebrow={t`Register design system`}
        title={t`Design guidance, review work, and adoption records`}
        description={t`Browse current guidance first, then selectively open review tooling or engineering detail when you need it.`}
      />
      <section id="canonical" aria-labelledby="canonical-title">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Trans>Canonical documentation</Trans>
        </p>
        <h2 id="canonical-title" className="mt-2 text-xl font-medium">
          <Trans>Current design-system results</Trans>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          <Trans>
            Foundations, components, and patterns foreground the accepted result
            and keep technical detail available on demand.
          </Trans>
        </p>
        <Link className={sectionLink} to="/internal/design-system/foundations">
          <span>
            <span className="block font-medium">
              <Trans>Foundations</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Plural
                value={FOUNDATION_ITEMS.length}
                one="# visual foundation"
                other="# visual foundations"
              />
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link className={sectionLink} to="/internal/design-system/components">
          <span>
            <span className="block font-medium">
              <Trans>Components</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Plural
                value={COMPONENT_ITEMS.length}
                one="# catalogued capability"
                other="# catalogued capabilities"
              />
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link className={sectionLink} to="/internal/design-system/patterns">
          <span>
            <span className="block font-medium">
              <Trans>Patterns</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Trans>
                Composition guidance and family-level system examples
              </Trans>
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
      <section id="review-and-records" aria-labelledby="review-records-title">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Trans>Selective depth</Trans>
        </p>
        <h2 id="review-records-title" className="mt-2 text-xl font-medium">
          <Trans>Review and engineering context</Trans>
        </h2>
        <Link className={sectionLink} to="/internal/design-system/workbench">
          <span>
            <span className="block font-medium">
              <Trans>Workbench</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Plural
                value={CURRENT_REVIEW.length}
                one="# item waiting for human review"
                other="# items waiting for human review"
              />
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link className={sectionLink} to="/internal/design-system/records">
          <span>
            <span className="block font-medium">
              <Trans>Internal records</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Trans>
                Adoption, engineering, decisions, and retained evidence
              </Trans>
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  )
}

export const PatternsOverviewPage = PatternsDocumentationOverview

const isStandaloneDocumentation =
  import.meta.env.VITE_DESIGN_SYSTEM_STANDALONE === 'true'

export const WorkbenchOverviewPage = () => {
  const { t } = useLingui()

  return (
    <div data-testid="workbench-overview" className="space-y-10">
      <PageHeader
        eyebrow={t`Non-canonical tooling`}
        title={t`Workbench`}
        description={t`Review questions, studies, and product-context tools live here without changing design authority.`}
      />
      <section id="current-review" aria-labelledby="workbench-review-title">
        <h2 id="workbench-review-title" className="text-xl font-medium">
          <Trans>Current review</Trans>
        </h2>
        {CURRENT_REVIEW.length === 0 ? (
          <p
            data-testid="current-review-empty"
            className="mt-3 border-y border-border py-5 text-sm text-muted-foreground"
          >
            <Trans>Nothing is waiting for human review.</Trans>
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border border-y border-border">
            {CURRENT_REVIEW.map((item) => (
              <Link
                key={item.destination}
                to={item.destination}
                className={sectionLink}
              >
                <span className="font-medium">
                  <Trans>Open current review item</Trans>
                </span>
                <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        )}
      </section>
      <section id="activity" aria-labelledby="workbench-activity-title">
        <h2 id="workbench-activity-title" className="text-xl font-medium">
          <Trans>Other activity</Trans>
        </h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {WORKBENCH_ACTIVITY.map((record) => (
            <Link
              key={record.sourceKey}
              to={record.route}
              className={sectionLink}
            >
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">
                    {t(getComponentNameMessage('transaction-action'))}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t(WORKBENCH_ACTIVITY_MESSAGES[record.activity])}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t(record.question)} · {t(record.owner)}
                </span>
              </span>
              <ArrowRight className="size-4" />
            </Link>
          ))}
        </div>
      </section>
      <section id="tools" aria-labelledby="workbench-tools-title">
        <h2 id="workbench-tools-title" className="text-xl font-medium">
          <Trans>Review tools</Trans>
        </h2>
        <Link className={sectionLink} to="/internal/design-system/studies">
          <span>
            <Trans>Experiments and studies</Trans>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link className={sectionLink} to="/internal/design-system/screens">
          <span>
            <Trans>Product contexts</Trans>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
      <section id="pattern-workbenches" aria-labelledby="pattern-tools-title">
        <h2 id="pattern-tools-title" className="text-xl font-medium">
          <Trans>Pattern workbenches</Trans>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {isStandaloneDocumentation ? (
            <Trans>
              This standalone page indexes the retained pattern records. Open
              their catalog summaries here; interactive review surfaces remain
              available only in the integrated lab.
            </Trans>
          ) : (
            <Trans>
              Open the retained scenarios only when you need to inspect states,
              comparisons, or unresolved boundaries behind a canonical summary.
            </Trans>
          )}
        </p>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {PATTERN_PRESENTATIONS.map((pattern) => {
            const source = getPatternSourceItem(pattern.sourceKey)

            return (
              <Link
                key={pattern.id}
                id={`pattern-${pattern.id}`}
                to={
                  isStandaloneDocumentation
                    ? `/internal/design-system/components/${source.id}`
                    : pattern.reviewRoute
                }
                className={sectionLink}
              >
                <span>
                  <span className="block font-medium">{t(pattern.label)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {pattern.activityLabel ? (
                      t(pattern.activityLabel)
                    ) : isStandaloneDocumentation ? (
                      <Trans>Integrated review surface unavailable here</Trans>
                    ) : (
                      <Trans>Retained review scenarios</Trans>
                    )}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isStandaloneDocumentation ? (
                    <Trans>Open catalog summary</Trans>
                  ) : (
                    <Trans>Open review surface</Trans>
                  )}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export const InternalRecordsOverviewPage = () => {
  const { t } = useLingui()

  return (
    <div data-testid="internal-records-overview" className="space-y-10">
      <PageHeader
        eyebrow={t`Engineering and history`}
        title={t`Internal records`}
        description={t`This page is a catalog and summary projection. Full decisions, plans, and evidence remain in their existing repository owners rather than being reproduced here.`}
      />
      <section id="adoption" aria-labelledby="adoption-title">
        <h2 id="adoption-title" className="text-xl font-medium">
          <Trans>Adoption and engineering</Trans>
        </h2>
        <Link className={sectionLink} to="/internal/design-system/status">
          <span>
            <span className="block font-medium">
              <Trans>Project status and coverage</Trans>
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              <Trans>Detailed machine gates and project tracking</Trans>
            </span>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
      <section id="history" aria-labelledby="history-title">
        <h2 id="history-title" className="text-xl font-medium">
          <Trans>Reference and history</Trans>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          <Trans>
            Accepted decisions, detailed reference, plans, and retained evidence
            stay in their existing repository owners. The documentation UI is a
            curated presentation, not a replacement authority.
          </Trans>
        </p>
        <div className="mt-5 divide-y divide-border border-y border-border">
          {PATTERN_PRESENTATIONS.map((pattern) => {
            const source = getPatternSourceItem(pattern.sourceKey)

            return (
              <Link
                key={pattern.id}
                id={`pattern-${pattern.id}`}
                to={`/internal/design-system/components/${source.id}`}
                className={sectionLink}
              >
                <span>
                  <span className="block font-medium">{t(pattern.label)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    <Trans>
                      Catalog authority, adoption, and retained evidence
                    </Trans>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Trans>Open catalog record</Trans>
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
