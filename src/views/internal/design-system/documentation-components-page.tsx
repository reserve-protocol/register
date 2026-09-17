import { useLingui } from '@lingui/react/macro'
import { PageHeader } from './catalog-ui'
import CanonicalComponentsOverview from './canonical-components-overview'
import { COMPONENT_GROUPS } from './component-catalog'
import { getComponentGroupMessage } from './documentation-catalog-messages'
import DocumentationToc from './documentation-toc'

const DocumentationComponentsPage = () => {
  const { t } = useLingui()

  return (
    <div
      data-testid="components-overview"
      className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_11rem]"
    >
      <div className="min-w-0 space-y-10">
        <PageHeader
          eyebrow={t`Reusable design system`}
          title={t`Components`}
          description={t`Scroll through the complete reusable system by job. Open a component only when you need its full states, guidance, implementation, or adoption detail.`}
        />
        <CanonicalComponentsOverview />
      </div>
      <DocumentationToc
        items={COMPONENT_GROUPS.map(({ id }) => ({
          id,
          label: t(getComponentGroupMessage(id)),
        }))}
      />
    </div>
  )
}

export default DocumentationComponentsPage
