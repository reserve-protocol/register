import 'react-loading-skeleton/dist/skeleton.css'
import '@/app.css'

import { Provider } from 'jotai'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import DesignSystemLab from '..'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    document.getElementById('app-container')?.scrollTo(0, 0)
  }, [pathname])

  return null
}

const StandaloneDocumentation = () => (
  <Provider>
    <BrowserRouter>
      <ScrollToTop />
      <TooltipProvider>
        <div
          data-runtime="standalone"
          className="h-full overflow-hidden bg-background text-foreground"
        >
          <div id="app-container" className="h-full overflow-auto">
            <Routes>
              <Route
                path="/internal/design-system/*"
                element={<DesignSystemLab />}
              />
              <Route
                path="*"
                element={<Navigate replace to="/internal/design-system" />}
              />
            </Routes>
          </div>
        </div>
      </TooltipProvider>
    </BrowserRouter>
  </Provider>
)

createRoot(document.getElementById('root')!).render(<StandaloneDocumentation />)
