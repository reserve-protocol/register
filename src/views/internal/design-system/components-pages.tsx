import { ArrowLeft, CircleDashed, ExternalLink } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  CatalogBadges,
  ComponentCompositionSource,
  ComponentReviewReadiness,
  DetailNavigation,
  ExpectedDecisions,
  PageHeader,
} from './catalog-ui'
import ButtonHierarchyDecision from './button-hierarchy-decision'
import ButtonLoadingDecision from './button-loading-decision'
import ModalActionDecision from './modal-action-decision'
import RichRecordReview from './rich-record-review'
import { getComponentItem } from './component-catalog'
import { getFoundationItem } from './foundation-catalog'
import CanonicalComponentsOverview from './canonical-components-overview'
import { CurrentReviewSpotlight } from './current-review-panel'
import ComponentVisualOutput from './component-visual-output'
import { EligibilityDialogInteractionReview } from './dialog-state-sheet'

export const ComponentsOverview = () => (
  <div data-testid="components-overview" className="space-y-10">
    <PageHeader
      eyebrow="Reusable design system"
      title="Components"
      description="Scroll through complete rendered state sheets by family, followed by one compact unresolved inventory. Open a detail page only for evidence, dependencies, extended compositions, or remaining decisions."
    />
    <CurrentReviewSpotlight />
    <CanonicalComponentsOverview />
  </div>
)

export const ComponentDetail = () => {
  const { componentId } = useParams()
  const { group, item } = getComponentItem(componentId)

  if (!group || !item) {
    return <Navigate replace to="/internal/design-system/components" />
  }

  return (
    <div data-testid={`component-detail-${item.id}`} className="space-y-8">
      <DetailNavigation
        title={group.name}
        items={group.items}
        path="/internal/design-system/components"
      />
      <div className="min-w-0 space-y-10">
        <Link
          to="/internal/design-system/components"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" /> All components
        </Link>
        <PageHeader
          eyebrow={group.name}
          title={item.name}
          description={item.description}
          trailing={<CatalogBadges item={item} />}
        />
        <ComponentReviewReadiness review={item.review} />
        <ComponentCompositionSource item={item} />
        <ComponentVisualOutput itemId={item.id} />
        {item.id === 'dialog' && <EligibilityDialogInteractionReview />}
        {item.id === 'table' && <RichRecordReview />}

        {item.relationships && item.relationships.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Related contracts</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These boundaries prevent visually similar components from being
                used for the wrong behavior.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {item.relationships.map((relationship) => {
                const related = getComponentItem(relationship.id).item
                return (
                  <Link
                    key={relationship.id}
                    to={`/internal/design-system/components/${relationship.id}`}
                    className="border border-border bg-card p-4 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-medium">
                      {related?.name ?? relationship.id}
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                      {relationship.note}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {item.outputStatus === 'none' && (
          <section
            data-testid="component-output-missing"
            className="border border-dashed border-border bg-card/50 p-5"
          >
            <div className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">
                {item.review.status === 'deferred'
                  ? 'No specimen scheduled'
                  : 'No lab output yet'}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground">
              No complete component specimen is rendered here. Existing evidence
              or a reusable recipe may still constrain later work; the authority
              and source badges above state what can be inherited.
            </p>
            <p className="mt-4 text-sm font-medium">Next: {item.nextAction}</p>
          </section>
        )}
        <details
          data-testid="component-secondary-details"
          className="group border border-border bg-card"
        >
          <summary className="cursor-pointer list-none p-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            Evidence, dependencies, states, and definition history
            <span className="ml-2 text-xs font-light text-muted-foreground group-open:hidden">
              Show
            </span>
          </summary>
          <div className="space-y-8 border-t border-border p-5">
            {item.id === 'button' && (
              <div className="space-y-10">
                <ButtonLoadingDecision />
                <ButtonHierarchyDecision />
              </div>
            )}
            {item.id === 'dialog' && <ModalActionDecision />}
            <section className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="What it is used for" copy={item.why} />
              <InfoCard title="Why this status" copy={item.statusDetail} />
              {item.implementationSource && (
                <InfoCard
                  title="Implementation source"
                  copy={item.implementationSource}
                />
              )}
            </section>
            <section className="grid gap-4 xl:grid-cols-2">
              <ListCard title="Current evidence" items={item.evidence} />
              <ListCard
                title="Foundation dependencies"
                items={group.foundationDependencies.map(
                  (foundationId) =>
                    getFoundationItem(foundationId)?.name ?? foundationId
                )}
              />
            </section>
            <section className="grid gap-4 xl:grid-cols-2">
              <ListCard
                title="States to prove"
                items={[...group.defaultStates, ...(item.stateAdditions ?? [])]}
              />
              <ListCard
                title="Questions to resolve"
                items={item.decisionPrompts}
              />
            </section>
            <ExpectedDecisions items={group.expectedDecisions} />
            {item.id === 'dialog' && (
              <Link
                to="/internal/design-system/studies#modal-family-study"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Review the real modal pressure tests
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </details>
      </div>
    </div>
  )
}

const InfoCard = ({ title, copy }: { title: string; copy: string }) => (
  <div className="border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-5 text-muted-foreground">{copy}</p>
  </div>
)

const ListCard = ({ title, items }: { title: string; items: string[] }) => (
  <section className="border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
)
