import { PageHeader } from './catalog-ui'
import LayoutArchitectureStudy from './layout-architecture-study'
import LayoutFoundationStudy from './layout-foundation-study'
import MeaningColorStudy from './meaning-color-study'
import ModalFamilyStudy from './modal-family-study'
import ModalGeometryStudy from './modal-geometry-study'

const LayoutStudiesPage = () => (
  <div data-testid="layout-studies-page" className="space-y-10">
    <PageHeader
      eyebrow="Unresolved visual work"
      title="Studies"
      description="Only open questions, competing alternatives, and active pressure tests live here. Accepted output is promoted to its Foundation or Component detail."
    />

    <MeaningColorStudy />
    <LayoutFoundationStudy />
    <LayoutArchitectureStudy />
    <ModalGeometryStudy />
    <ModalFamilyStudy />
  </div>
)

export default LayoutStudiesPage
