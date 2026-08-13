import { ArrowLeft, CircleDashed } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  CatalogCard,
  CatalogBadges,
  DetailSidebar,
  ExpectedDecisions,
  PageHeader,
} from './catalog-ui'
import FoundationReference from './foundation-reference'
import FoundationCandidateDirection from './foundation-candidate-direction'
import ColorFoundationDefinition from './color-foundation-definition'
import { FOUNDATION_ITEMS, getFoundationItem } from './foundation-catalog'

export const FoundationsOverview = () => (
  <div data-testid="foundations-overview" className="space-y-8">
    <PageHeader
      eyebrow="Expected system layer"
      title="Foundations"
      description="The structural decisions every component and screen should inherit. Slots stay visible before they are audited or defined so missing work is explicit."
    />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {FOUNDATION_ITEMS.map((item) => (
        <CatalogCard
          key={item.id}
          item={item}
          to={`/internal/design-system/foundations/${item.id}`}
        />
      ))}
    </div>
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
        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Why it matters" copy={item.why} />
          <InfoCard title="Current status" copy={item.statusDetail} />
        </section>
        <ExpectedDecisions items={item.expectedDecisions} />
        <FoundationReference foundationId={item.id} />
        <FoundationCandidateDirection foundationId={item.id} />
        {item.id === 'color' ? (
          <ColorFoundationDefinition />
        ) : (
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
