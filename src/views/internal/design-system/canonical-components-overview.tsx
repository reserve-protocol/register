import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ComponentGroup, ComponentItem } from './catalog-types'
import { COMPONENT_GROUPS, COMPONENT_ITEMS } from './component-catalog'
import {
  getComponentGroupMessage,
  getComponentNameMessage,
} from './documentation-catalog-messages'
import { COMPLEX_COMPONENT_DESTINATIONS } from './documentation-component-destinations'
import {
  canMountDocumentationComponentSpecimen,
  DocumentationComponentSpecimen,
} from './documentation-component-specimens'
import { DocumentationStatus } from './documentation-status'
import {
  CODE_STATUS_MESSAGES,
  DESIGN_STATUS_MESSAGES,
  PRODUCTION_STATUS_MESSAGES,
  getComponentPresentation,
} from './documentation-presentation'

const baselineCount = COMPONENT_ITEMS.filter(
  (item) => item.designAuthority === 'current-baseline'
).length

const PATTERN_COMPONENTS = new Set([
  'table',
  'chart',
  'global-navigation',
  'product-navigation',
])

const CanonicalComponentsOverview = () => {
  const { t } = useLingui()

  return (
    <section
      className="space-y-10"
      aria-labelledby="canonical-components-heading"
    >
      <div className="border-b border-border pb-6">
        <p className="text-sm font-medium text-primary">
          <Trans>Component reference</Trans>
        </p>
        <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <h2
              id="canonical-components-heading"
              className="text-2xl font-light"
            >
              <Trans>The reusable system</Trans>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              <Trans>
                Scroll through every family with the current result in view.
                Open a detail page only when you need complete states,
                implementation guidance, or review history.
              </Trans>
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {t`${baselineCount} accepted · ${COMPONENT_ITEMS.length} total`}
          </span>
        </div>
        <nav
          aria-label={t`Component families`}
          className="mt-5 flex flex-wrap gap-x-4 gap-y-2"
        >
          {COMPONENT_GROUPS.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(getComponentGroupMessage(group.id))}
            </a>
          ))}
        </nav>
      </div>

      <div data-testid="canonical-component-overview" className="space-y-16">
        {COMPONENT_GROUPS.map((group) => (
          <ComponentFamily key={group.id} group={group} />
        ))}
      </div>
    </section>
  )
}

const ComponentFamily = ({ group }: { group: ComponentGroup }) => {
  const { t } = useLingui()
  const headingId = `component-group-${group.id}-title`

  return (
    <section
      id={group.id}
      data-testid="component-group-section"
      data-component-group={group.id}
      aria-labelledby={headingId}
      className="scroll-mt-20 md:scroll-mt-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <h3 id={headingId} className="text-xl font-medium">
          {t(getComponentGroupMessage(group.id))}
        </h3>
        <span className="text-xs text-muted-foreground">
          <Plural value={group.items.length} one="# item" other="# items" />
        </span>
      </div>
      <div className="divide-y divide-border">
        {group.items.map((item) => (
          <ComponentReference key={item.id} groupId={group.id} item={item} />
        ))}
      </div>
    </section>
  )
}

const ComponentReference = ({
  groupId,
  item,
}: {
  groupId: string
  item: ComponentItem
}) => {
  const { t } = useLingui()
  const presentation = getComponentPresentation(item)
  const name = t(getComponentNameMessage(item.id))
  const hasSpecimen = canMountDocumentationComponentSpecimen(
    item.id,
    presentation.design
  )
  const detailDestination =
    COMPLEX_COMPONENT_DESTINATIONS[item.id] ??
    `/internal/design-system/components/${item.id}`

  return (
    <article
      id={item.id}
      data-testid="component-reference-section"
      data-component-id={item.id}
      className="scroll-mt-20 py-7 md:scroll-mt-6"
    >
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h4 className="text-base font-medium">{name}</h4>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {item.description}
          </p>
          <div className="mt-2">
            <DocumentationStatus status={presentation.design}>
              {t(DESIGN_STATUS_MESSAGES[presentation.design])}
            </DocumentationStatus>
          </div>
        </div>

        {hasSpecimen ? (
          <div
            data-testid="component-overview-output"
            className="flex min-h-32 min-w-0 items-center overflow-x-auto border-y border-border bg-muted/30 px-4 py-6 sm:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <div data-testid="component-specimen-set" className="w-full">
              <DocumentationComponentSpecimen
                groupId={groupId}
                itemId={item.id}
              />
            </div>
          </div>
        ) : PATTERN_COMPONENTS.has(item.id) ? (
          <PatternSlot name={name} />
        ) : item.id === 'card' ? (
          <CardReference />
        ) : presentation.design === 'accepted' ? (
          <IsolationSlot />
        ) : presentation.design === 'exploring' ? (
          <TruthfulTreatment kind="exploring" />
        ) : (
          <TruthfulTreatment kind={presentation.design} />
        )}

        <div
          data-testid="component-overview-metadata"
          className="min-w-0 lg:col-start-1 lg:row-start-2"
        >
          <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
            <StatusFact
              label={t`Code`}
              value={t(CODE_STATUS_MESSAGES[presentation.code])}
            />
            <StatusFact
              label={t`Production`}
              value={t(PRODUCTION_STATUS_MESSAGES[presentation.production])}
            />
          </div>
          <Link
            data-testid={`component-overview-${item.id}`}
            to={detailDestination}
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trans>Open details</Trans>
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

const IsolationSlot = () => (
  <div
    data-testid="component-isolation-slot"
    className="flex min-h-32 min-w-0 items-center border-y border-border bg-muted/30 px-4 py-6 sm:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
  >
    <div>
      <p className="text-sm font-medium">
        <Trans>Accepted owner kept outside this lightweight overview</Trans>
      </p>
    </div>
  </div>
)

const CardReference = () => (
  <div
    data-testid="component-card-reference"
    className="flex min-h-32 min-w-0 items-center border-y border-border bg-muted/30 px-4 py-6 sm:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
  >
    <div>
      <p className="text-sm font-medium">
        <Trans>Accepted source-bound feature-card treatment</Trans>
      </p>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
        <Trans>
          The current result preserves the real Home feature card and its
          structural-region rules. It does not define a generic Card component
          or authorize unrelated card families.
        </Trans>
      </p>
    </div>
  </div>
)

const PatternSlot = ({ name }: { name: string }) => (
  <div
    data-testid="component-pattern-slot"
    className="flex min-h-32 min-w-0 items-center border-y border-border bg-muted/30 px-4 py-6 sm:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
  >
    <div>
      <p className="text-sm font-medium">
        <Trans>{name} is documented as a pattern</Trans>
      </p>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
        <Trans>
          Its dedicated page preserves the canonical result without loading the
          full review workspace into this overview.
        </Trans>
      </p>
    </div>
  </div>
)

const TruthfulTreatment = ({
  kind,
}: {
  kind: 'exploring' | 'not-started' | 'not-planned' | 'superseded'
}) => (
  <div
    data-testid={
      kind === 'exploring'
        ? 'component-exploring-treatment'
        : 'component-undefined-treatment'
    }
    className="flex min-h-28 min-w-0 items-center border-y border-dashed border-border px-4 py-6 sm:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
  >
    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
      {kind === 'exploring' ? (
        <Trans>
          This direction is still being explored. Its detail page preserves the
          current evidence without presenting it as the system.
        </Trans>
      ) : kind === 'not-planned' ? (
        <Trans>
          No generic component is planned for the current system. Reopen this
          record only when a real product job requires it.
        </Trans>
      ) : kind === 'superseded' ? (
        <Trans>
          This result has been superseded. Its record remains available for
          history without presenting it as the system.
        </Trans>
      ) : (
        <Trans>
          A canonical result has not been prepared yet. Existing evidence
          remains available on the detail page.
        </Trans>
      )}
    </p>
  </div>
)

const StatusFact = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span className="font-medium text-foreground">{label}</span> · {value}
  </p>
)

export default CanonicalComponentsOverview
