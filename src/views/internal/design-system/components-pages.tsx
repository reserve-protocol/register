import { ArrowLeft, CircleDashed, ExternalLink } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  CatalogCard,
  CatalogBadges,
  ComponentReviewReadiness,
  DetailSidebar,
  ExpectedDecisions,
  PageHeader,
} from './catalog-ui'
import ButtonStateSheet from './button-state-sheet'
import ButtonHierarchyDecision from './button-hierarchy-decision'
import ButtonLoadingDecision from './button-loading-decision'
import ModalActionDecision from './modal-action-decision'
import EntityIdentityStateSheet from './entity-identity-state-sheet'
import MetricStateSheet from './metric-state-sheet'
import InformationRowStateSheet from './information-row-state-sheet'
import EmptyStateStateSheet from './empty-state-state-sheet'
import CheckboxStateSheet from './checkbox-state-sheet'
import IconButtonStateSheet from './icon-button-state-sheet'
import DialogStateSheet from './dialog-state-sheet'
import { COMPONENT_GROUPS, getComponentItem } from './component-catalog'
import ComponentWorkMap from './component-work-map'
import CoreComponentBoard from './core-component-board'
import ProductFacingReviewBoard from './product-facing-review-board'

export const ComponentsOverview = () => (
  <div data-testid="components-overview" className="space-y-10">
    <PageHeader
      eyebrow="Expected capability catalog"
      title="Components"
      description="Working candidates first; capability inventory and audit status below."
    />
    <ProductFacingReviewBoard />
    <CoreComponentBoard />
    <ComponentWorkMap />
    {COMPONENT_GROUPS.map((group) => (
      <section key={group.id} aria-labelledby={`${group.id}-heading`}>
        <div className="mb-4">
          <h2 id={`${group.id}-heading`} className="text-xl font-semibold">
            {group.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {group.description}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {group.items.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              to={`/internal/design-system/components/${item.id}`}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
)

export const ComponentDetail = () => {
  const { componentId } = useParams()
  const { group, item } = getComponentItem(componentId)

  if (!group || !item) {
    return <Navigate replace to="/internal/design-system/components" />
  }

  return (
    <div
      data-testid={`component-detail-${item.id}`}
      className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <DetailSidebar
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
        {item.outputStatus !== 'none' && (
          <ComponentReviewReadiness review={item.review} />
        )}
        {item.id === 'button' && (
          <div className="space-y-10">
            <ButtonLoadingDecision />
            <ButtonHierarchyDecision />
          </div>
        )}
        {item.id === 'dialog' && <ModalActionDecision />}
        {item.id === 'checkbox' && <CheckboxStateSheet />}
        {item.id === 'icon-button' && <IconButtonStateSheet />}
        {item.id === 'dialog' && <DialogStateSheet />}
        {item.id === 'entity-identity' && <EntityIdentityStateSheet />}
        {item.id === 'metric' && <MetricStateSheet />}
        {item.id === 'table' && <InformationRowStateSheet />}
        {item.id === 'empty-state' && <EmptyStateStateSheet />}
        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="What it is used for" copy={item.why} />
          <InfoCard title="Why this status" copy={item.statusDetail} />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <ListCard title="Current evidence" items={item.evidence} />
          <ListCard
            title="Foundation dependencies"
            items={group.foundationDependencies}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <ListCard
            title="States to prove"
            items={[...group.defaultStates, ...(item.stateAdditions ?? [])]}
          />
          <ListCard title="Questions to resolve" items={item.decisionPrompts} />
        </section>

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

        <ExpectedDecisions items={group.expectedDecisions} />
        {item.id === 'button' && (
          <section className="space-y-10">
            <ButtonStateSheet />
            <Link
              to="/internal/design-system/studies#actions-candidate-study"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Review the provisional V1 Actions matrix
              <ExternalLink className="h-4 w-4" />
            </Link>
          </section>
        )}
        {item.id === 'dialog' && (
          <Link
            to="/internal/design-system/studies#modal-family-study"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Review the real modal pressure tests
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
        {item.outputStatus === 'none' && (
          <section
            data-testid="component-output-missing"
            className="border border-dashed border-border bg-card/50 p-5"
          >
            <div className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">No lab output yet</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              The product audit must identify current implementations, use
              cases, and exceptions before a v1 proposal is designed here.
            </p>
            <p className="mt-4 text-sm font-medium">Next: {item.nextAction}</p>
          </section>
        )}
      </div>
    </div>
  )
}

const InfoCard = ({ title, copy }: { title: string; copy: string }) => (
  <div className="border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
  </div>
)

const ListCard = ({ title, items }: { title: string; items: string[] }) => (
  <section className="border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
)
