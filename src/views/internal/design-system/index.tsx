import { Navigate, Route, Routes } from 'react-router-dom'
import { ComponentDetail, ComponentsOverview } from './components-pages'
import { FoundationDetail, FoundationsOverview } from './foundations-pages'
import LabShell from './lab-shell'
import LayoutStudiesPage from './layout-studies-page'
import { PageHeader } from './catalog-ui'
import ProgressDashboard from './progress-dashboard'
import ScreensPage from './screens-page'
import { CurrentReviewList } from './current-review-panel'

const DesignSystemLab = () => (
  <LabShell>
    <Routes>
      <Route
        index
        element={<Navigate replace to="/internal/design-system/foundations" />}
      />
      <Route path="foundations" element={<FoundationsOverview />} />
      <Route path="foundations/:foundationId" element={<FoundationDetail />} />
      <Route path="components" element={<ComponentsOverview />} />
      <Route path="components/:componentId" element={<ComponentDetail />} />
      <Route path="studies" element={<LayoutStudiesPage />} />
      <Route path="screens" element={<ScreensPage />} />
      <Route path="status" element={<StatusPage />} />
      <Route
        path="*"
        element={<Navigate replace to="/internal/design-system/foundations" />}
      />
    </Routes>
  </LabShell>
)

const StatusPage = () => (
  <div data-testid="project-status-page" className="space-y-8">
    <PageHeader
      eyebrow="Project machinery"
      title="Project status"
      description="The full tracker lives here rather than competing with the design work on every visit."
    />
    <CurrentReviewList />
    <ProgressDashboard />
  </div>
)

export default DesignSystemLab
