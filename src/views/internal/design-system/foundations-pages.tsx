import { ArrowLeft, CircleDashed } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  CatalogBadges,
  DetailSidebar,
  ExpectedDecisions,
  PageHeader,
} from './catalog-ui'
import FoundationReference from './foundation-reference'
import FoundationCandidateDirection from './foundation-candidate-direction'
import ColorFoundationDefinition from './color-foundation-definition'
import { FOUNDATION_ITEMS, getFoundationItem } from './foundation-catalog'
import FoundationOverview, { FoundationSpecimen } from './foundation-overview'
import { CurrentReviewSpotlight } from './current-review-panel'
import TypographyStudy from './typography-study'
import SpacingRhythmStudy from './spacing-rhythm-study'
import ShapeStudy from './shape-study'
import ElevationStudy from './elevation-study'
import IconographyStudy from './iconography-study'
import MotionStudy from './motion-study'
import AccessibilityStudy from './accessibility-study'

export const FoundationsOverview = () => (
  <div data-testid="foundations-overview" className="space-y-8">
    <PageHeader
      eyebrow="Current visual system"
      title="Foundations"
      description="Scan the system itself. Each specimen opens the full definition, local readiness, and deeper evidence."
    />
    <CurrentReviewSpotlight />
    <FoundationOverview />
  </div>
)

export const FoundationDetail = () => {
  const { foundationId } = useParams()
  const item = getFoundationItem(foundationId)

  if (!item) {
    return <Navigate replace to="/internal/design-system/foundations" />
  }

  return (
    <div
      data-testid={`foundation-detail-${item.id}`}
      className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <DetailSidebar
        title="Foundations"
        items={FOUNDATION_ITEMS}
        path="/internal/design-system/foundations"
      />
      <div className="min-w-0 space-y-10">
        <Link
          to="/internal/design-system/foundations"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" /> All foundations
        </Link>
        <PageHeader
          eyebrow="Foundation"
          title={item.name}
          description={item.description}
          trailing={<CatalogBadges item={item} />}
        />
        <section
          className="space-y-4"
          aria-labelledby="visual-definition-heading"
        >
          <div>
            <p className="text-sm font-medium text-primary">
              Visual definition
            </p>
            <h2
              id="visual-definition-heading"
              className="mt-1 text-2xl font-light"
            >
              {item.name} in V1
            </h2>
            <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
              {item.statusDetail}
            </p>
          </div>
          <div className="flex min-h-48 items-center justify-center border border-border bg-background p-6">
            <FoundationSpecimen foundationId={item.id} />
          </div>
        </section>
        <FoundationRichDefinition foundationId={item.id} />
        <FoundationCandidateDirection foundationId={item.id} />
        {item.id === 'color' && <ColorFoundationDefinition />}
        {item.outputStatus !== 'accepted' && item.id !== 'color' && (
          <section className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
            <div className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">V1 definition</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Not defined yet. This slot will hold accepted values, rules, and
              usage guidance after design review.
            </p>
          </section>
        )}
        <details
          data-testid="foundation-secondary-details"
          className="group border border-border bg-card"
        >
          <summary className="cursor-pointer list-none p-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            Evidence, rationale, and definition status
            <span className="ml-2 text-xs font-light text-muted-foreground group-open:hidden">
              Show
            </span>
          </summary>
          <div className="space-y-8 border-t border-border p-5">
            <section className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Why it matters" copy={item.why} />
              <InfoCard title="Current status" copy={item.statusDetail} />
            </section>
            <ExpectedDecisions items={item.expectedDecisions} />
            <FoundationReference foundationId={item.id} />
          </div>
        </details>
      </div>
    </div>
  )
}

const InfoCard = ({ title, copy }: { title: string; copy: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
  </div>
)

const FoundationRichDefinition = ({
  foundationId,
}: {
  foundationId: string
}) => {
  if (foundationId === 'typography') return <TypographyStudy />
  if (foundationId === 'spacing') return <SpacingRhythmStudy />
  if (foundationId === 'radius') return <ShapeStudy />
  if (foundationId === 'elevation') return <ElevationStudy />
  if (foundationId === 'iconography') return <IconographyStudy />
  if (foundationId === 'motion') return <MotionStudy />
  if (foundationId === 'accessibility') return <AccessibilityStudy />
  return null
}
