import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import ButtonHierarchyDecision from '../button-hierarchy-decision'
import ButtonLoadingDecision from '../button-loading-decision'
import ButtonStateSheet from '../button-state-sheet'
import { DetailNavigation, ExpectedDecisions } from '../catalog-ui'
import { getComponentItem } from '../component-catalog'
import { COMPLEX_COMPONENT_DESTINATIONS } from '../documentation-component-destinations'
import {
  canMountDocumentationComponentSpecimen,
  DocumentationComponentSpecimen,
} from '../documentation-component-specimens'
import { DocumentationStatus } from '../documentation-status'
import {
  CODE_STATUS_MESSAGES,
  DESIGN_STATUS_MESSAGES,
  PRODUCTION_STATUS_MESSAGES,
  getComponentPresentation,
} from '../documentation-presentation'
import { getFoundationItem } from '../foundation-catalog'

const StandaloneComponentDetail = () => {
  const { t } = useLingui()
  const { componentId } = useParams()
  const { group, item } = getComponentItem(componentId)

  if (!group || !item) {
    return <Navigate replace to="/internal/design-system/components" />
  }

  const presentation = getComponentPresentation(item)
  const canonicalDestination =
    COMPLEX_COMPONENT_DESTINATIONS[item.id] ??
    `/internal/design-system/components#${item.id}`
  const canMountSpecimen = canMountDocumentationComponentSpecimen(
    item.id,
    presentation.design
  )

  return (
    <div data-testid={`component-detail-${item.id}`} className="space-y-8">
      <DetailNavigation
        title={group.name}
        items={group.items}
        path="/internal/design-system/components"
      />
      <div className="min-w-0 space-y-10">
        <Link
          to={`/internal/design-system/components#${item.id}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" /> All components
        </Link>
        <header className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">{group.name}</p>
          <h1 className="mt-1 text-3xl font-light">{item.name}</h1>
          <p
            data-testid="component-detail-job"
            className="mt-2 max-w-3xl text-base leading-6 text-muted-foreground"
          >
            {item.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <DocumentationStatus status={presentation.design}>
              {t(DESIGN_STATUS_MESSAGES[presentation.design])}
            </DocumentationStatus>
            <span className="text-xs text-muted-foreground">
              <Trans>Code</Trans> · {t(CODE_STATUS_MESSAGES[presentation.code])}
            </span>
            <span className="text-xs text-muted-foreground">
              <Trans>Production</Trans> ·{' '}
              {t(PRODUCTION_STATUS_MESSAGES[presentation.production])}
            </span>
          </div>
        </header>

        {item.id === 'button' ? (
          <ButtonStateSheet />
        ) : canMountSpecimen ? (
          <section
            data-testid="standalone-canonical-specimen"
            className="overflow-x-auto border-y border-border bg-muted/30 px-4 py-8 sm:px-6"
          >
            <DocumentationComponentSpecimen
              groupId={group.id}
              itemId={item.id}
            />
          </section>
        ) : (
          <section
            data-testid="standalone-compatibility-boundary"
            className="border-y border-border bg-muted/30 px-4 py-6 sm:px-6"
          >
            <h2 className="font-semibold">
              <Trans>Source-bound result</Trans>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground">
              <Trans>
                This record preserves the accepted source and evidence without
                starting product wallet or chain providers or inventing a
                replacement specimen.
              </Trans>
            </p>
            <Link
              data-testid="standalone-canonical-return"
              to={canonicalDestination}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" />
              {item.id === 'transaction-action' ? (
                <Trans>Open Workbench summary</Trans>
              ) : COMPLEX_COMPONENT_DESTINATIONS[item.id] ? (
                <Trans>Open pattern documentation</Trans>
              ) : (
                <Trans>Return to the canonical overview result</Trans>
              )}
            </Link>
          </section>
        )}

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
                const relatedPresentation = related
                  ? getComponentPresentation(related)
                  : undefined
                return (
                  <Link
                    key={relationship.id}
                    to={`/internal/design-system/components/${relationship.id}`}
                    className={`border border-border bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${roles.interaction.contentHover}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-medium">
                          {related?.name ?? relationship.id}
                        </span>
                        {relatedPresentation && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            <Trans>Design</Trans> ·{' '}
                            {t(
                              DESIGN_STATUS_MESSAGES[relatedPresentation.design]
                            )}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
            <section className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="What it is used for" copy={item.why} />
              <InfoCard title="Current review scope" copy={item.review.scope} />
              <InfoCard title="Why this status" copy={item.statusDetail} />
              {item.implementationSource && (
                <InfoCard
                  title="Implementation source"
                  copy={item.implementationSource}
                />
              )}
              {item.compositionSource && (
                <InfoCard
                  title="Composition source"
                  copy={`${item.compositionSource.label} · ${item.compositionSource.componentId}#${item.compositionSource.anchor}`}
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

export default StandaloneComponentDetail
