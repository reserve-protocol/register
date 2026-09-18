import { useLingui } from '@lingui/react/macro'
import { PageHeader } from './catalog-ui'
import CanonicalComponentsOverview from './canonical-components-overview'

const DocumentationComponentsPage = () => {
  const { t } = useLingui()

  return (
    <div data-testid="components-overview" className="min-w-0 space-y-10">
      <PageHeader
        eyebrow={t`Reusable design system`}
        title={t`Components`}
        description={t`Scroll through the complete reusable system by job. Open a component only when you need its full states, guidance, implementation, or adoption detail.`}
      />
      <CanonicalComponentsOverview />
    </div>
  )
}

export default DocumentationComponentsPage
