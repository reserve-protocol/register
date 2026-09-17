import { Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'react-router-dom'
import { PageHeader } from './catalog-ui'
import LayoutArchitectureStudy from './layout-architecture-study'
import LayoutFoundationStudy from './layout-foundation-study'
import MeaningColorStudy from './meaning-color-study'
import ModalFamilyStudy from './modal-family-study'
import ModalGeometryStudy from './modal-geometry-study'

const LayoutStudiesPage = () => {
  const { t } = useLingui()

  return (
    <div data-testid="layout-studies-page" className="space-y-10">
      <PageHeader
        eyebrow={t`Unresolved visual work`}
        title={t`Studies`}
        description={t`Studies retain non-canonical working material and historical evidence. Their local labels do not override current catalog authority.`}
      />

      <aside
        data-testid="studies-mixed-status-warning"
        className="border-y border-border py-5 text-sm leading-6 text-muted-foreground"
      >
        <p>
          <Trans>
            This legacy page mixes active studies with retained or superseded
            material. Treat the content below as non-canonical evidence unless
            its current owner says otherwise.
          </Trans>
        </p>
        <Link
          to="/internal/design-system/foundations"
          className="mt-2 inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trans>Return to canonical Foundations guidance</Trans>
        </Link>
      </aside>

      <MeaningColorStudy />
      <LayoutFoundationStudy />
      <LayoutArchitectureStudy />
      <ModalGeometryStudy />
      <ModalFamilyStudy />
    </div>
  )
}

export default LayoutStudiesPage
