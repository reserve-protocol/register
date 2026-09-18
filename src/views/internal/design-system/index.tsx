import { Navigate, Route, Routes } from 'react-router-dom'
import ComponentDetail from './component-detail-entry'
import { FoundationDetail, FoundationsOverview } from './foundations-pages'
import LabShell from './lab-shell'
import LayoutStudiesPage from './layout-studies-page'
import { PageHeader } from './catalog-ui'
import ProgressDashboard from './progress-dashboard'
import ScreensPage from './screens-page'
import { CurrentReviewList } from './current-review-panel'
import {
  DocumentationStartPage,
  InternalRecordsOverviewPage,
  PatternsOverviewPage,
  WorkbenchOverviewPage,
} from './documentation-pages'
import DocumentationComponentsPage from './documentation-components-page'
import DocumentationLanguageProvider from './documentation-language-provider'

const DesignSystemLab = () => (
  <DocumentationLanguageProvider>
    <LabShell>
      <Routes>
        <Route index element={<DocumentationStartPage />} />
        <Route path="foundations" element={<FoundationsOverview />} />
        <Route
          path="foundations/:foundationId"
          element={<FoundationDetail />}
        />
        <Route path="components" element={<DocumentationComponentsPage />} />
        <Route path="components/:componentId" element={<ComponentDetail />} />
        <Route path="patterns" element={<PatternsOverviewPage />} />
        <Route
          path="patterns/charts"
          element={
            <Navigate replace to="/internal/design-system/components/chart" />
          }
        />
        <Route
          path="patterns/tables"
          element={
            <Navigate replace to="/internal/design-system/components/table" />
          }
        />
        <Route
          path="patterns/forms"
          element={
            <Navigate replace to="/internal/design-system/components/input" />
          }
        />
        <Route
          path="patterns/navigation"
          element={
            <Navigate
              replace
              to="/internal/design-system/components/product-navigation"
            />
          }
        />
        <Route
          path="patterns/transactions"
          element={
            <Navigate
              replace
              to="/internal/design-system/components/transaction-action"
            />
          }
        />
        <Route path="workbench" element={<WorkbenchOverviewPage />} />
        <Route path="records" element={<InternalRecordsOverviewPage />} />
        <Route path="studies" element={<LayoutStudiesPage />} />
        <Route path="screens" element={<ScreensPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route
          path="*"
          element={<Navigate replace to="/internal/design-system" />}
        />
      </Routes>
    </LabShell>
  </DocumentationLanguageProvider>
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
