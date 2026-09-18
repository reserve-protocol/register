import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from './catalog-ui'
import DocumentationPatternCharts from './documentation-pattern-charts'
import NavigationPatternDocumentation from './documentation-pattern-navigation'
import { DocumentationTransactionWorkbench } from './documentation-transaction-workbench'
import {
  PATTERN_PRESENTATIONS,
  hasAcceptedPatternAuthority,
  translateDocumentationText,
  type PatternPresentation,
} from './documentation-presentation'
import { FormPatternSpecimen } from './documentation-pattern-specimens'
import DocumentationPatternTables from './documentation-pattern-tables'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import { DocumentationStatus } from './documentation-status'

const SPECIMENS: Partial<Record<PatternPresentation['id'], ReactNode>> = {
  forms: <FormPatternSpecimen />,
}

const RICH_SPECIMENS: Partial<Record<PatternPresentation['id'], ReactNode>> = {
  charts: <DocumentationPatternCharts />,
  tables: <DocumentationPatternTables />,
  navigation: <NavigationPatternDocumentation />,
  transactions: <DocumentationTransactionWorkbench />,
}

const PatternsDocumentationOverview = () => {
  const { t } = useLingui()

  return (
    <div data-testid="patterns-overview" className="min-w-0 space-y-10">
      <PageHeader
        eyebrow={t`Canonical compositions`}
        title={t`Patterns`}
        description={t`Scroll through composition systems and their representative states. Accepted patterns lead; paused explorations are labeled in place.`}
      />
      <div data-testid="canonical-pattern-overview" className="space-y-16">
        {PATTERN_PRESENTATIONS.map((pattern) => (
          <PatternReference key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </div>
  )
}

const PatternReference = ({ pattern }: { pattern: PatternPresentation }) => {
  const { t } = useLingui()
  const hasAcceptedAuthority = hasAcceptedPatternAuthority(pattern.id)
  const richSpecimen =
    pattern.id === 'transactions' || hasAcceptedAuthority
      ? RICH_SPECIMENS[pattern.id]
      : undefined
  const specimen = hasAcceptedAuthority ? SPECIMENS[pattern.id] : undefined
  const componentId = pattern.sourceKey.replace('component:', '')

  return (
    <section
      id={pattern.id}
      data-testid="pattern-reference-section"
      data-source-key={pattern.sourceKey}
      aria-labelledby={`pattern-${pattern.id}-title`}
      className="scroll-mt-20 md:scroll-mt-6"
    >
      <div className="border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id={`pattern-${pattern.id}-title`}
            className="text-2xl font-light"
          >
            {t(pattern.label)}
          </h2>
          <DocumentationStatus status={pattern.design}>
            {t(pattern.designLabel)}
          </DocumentationStatus>
          {pattern.activityLabel && (
            <span className="text-xs text-muted-foreground">
              <Trans>Activity</Trans> · <span>{t(pattern.activityLabel)}</span>
            </span>
          )}
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {translateDocumentationText(pattern.description, t)}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
          {t(pattern.scope)}
        </p>
      </div>

      {richSpecimen ? (
        <div data-testid="pattern-rich-reference" className="py-5">
          {richSpecimen}
        </div>
      ) : specimen ? (
        <PatternCanvas pattern={pattern}>{specimen}</PatternCanvas>
      ) : (
        <div
          data-testid="pattern-no-specimen"
          className="border-b border-dashed border-border py-8"
        >
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {pattern.id === 'transactions' ? (
              <Trans>
                No canonical specimen is shown while this pattern is paused. The
                verified checkpoint remains available for review without being
                promoted as the system.
              </Trans>
            ) : (
              <Trans>
                No canonical result is shown because the required accepted
                design authority is not currently present.
              </Trans>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-1 pt-3">
        <Link className={depthLink} to={pattern.workbenchRoute}>
          <Trans>Open Workbench summary</Trans>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
        <Link className={depthLink} to={pattern.recordsRoute}>
          <Trans>Open Internal records</Trans>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
        <Link
          className={depthLink}
          to={`/internal/design-system/components/${componentId}`}
        >
          <Trans>Open component catalog record</Trans>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}

const PatternCanvas = ({
  children,
  pattern,
}: {
  children: ReactNode
  pattern: PatternPresentation
}) => {
  const { t } = useLingui()

  return (
    <div
      data-testid="pattern-specimen-canvas"
      data-documentation-layer="canonical-pattern"
      className="py-5"
    >
      <DocumentationSpecimenCanvas
        host={{
          name: pattern.hostLabel ? t(pattern.hostLabel) : '',
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Documentation specimen region`,
        }}
        mode="fluid"
        backdrop="neutral"
        padding="contained"
        align="center"
        provenance={pattern.provenance ? t(pattern.provenance) : undefined}
      >
        {children}
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const depthLink =
  'inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default PatternsDocumentationOverview
