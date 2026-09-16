import '@/app.css'
import LanguageProvider from '@/i18n'
import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { ChartSourceSet } from './source-set'

type PreviewState = {
  chartType: 'candles' | 'line'
  inspection: 'current' | 'header'
  theme: 'dark' | 'light'
}

function readPreviewState(): PreviewState {
  const params = new URLSearchParams(window.location.hash.slice(1))
  return {
    chartType: params.get('chart') === 'candles' ? 'candles' : 'line',
    inspection: params.get('inspection') === 'current' ? 'current' : 'header',
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
  }
}

function MobilePreview() {
  const [preview, setPreview] = useState(readPreviewState)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)

  useEffect(() => {
    const updatePreview = () => setPreview(readPreviewState())
    const updateWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener('hashchange', updatePreview)
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('hashchange', updatePreview)
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', preview.theme)
    document.documentElement.classList.toggle('dark', preview.theme === 'dark')
  }, [preview.theme])

  return (
    <main
      data-testid="chart-preview-root"
      data-inspection-mode={preview.inspection}
      data-chart-type={preview.chartType}
      data-theme={preview.theme}
      data-viewport-width={viewportWidth}
      className="h-full space-y-8 overflow-y-auto bg-background pb-8 text-foreground"
    >
      <ChartSourceSet
        chartType={preview.chartType}
        inspectHeader={preview.inspection === 'header'}
        narrow
      />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <MobilePreview />
  </LanguageProvider>
)
