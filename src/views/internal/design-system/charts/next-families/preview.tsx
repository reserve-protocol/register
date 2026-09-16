import '@/app.css'
import './preview.css'
import LanguageProvider from '@/i18n'
import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { NextChartFamiliesReview } from './review'

type PreviewWidth = 'normal' | 'narrow' | '390' | '320'

function readPreviewParams() {
  return new URLSearchParams(window.location.hash.slice(1))
}

function Preview() {
  const [params, setParams] = useState(readPreviewParams)
  const embedded = params.get('embedded') === 'true'
  const theme = params.get('theme') === 'dark' ? 'dark' : 'light'
  const [width, setWidth] = useState<PreviewWidth>('normal')

  useEffect(() => {
    const updateParams = () => setParams(readPreviewParams())
    window.addEventListener('hashchange', updateParams)
    return () => window.removeEventListener('hashchange', updateParams)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (embedded) {
    return (
      <main className={cn('min-h-screen px-3 py-5', roles.surface.canvas)}>
        <NextChartFamiliesReview />
      </main>
    )
  }

  const mobileWidth = width === '390' ? 390 : 320
  const iframeHash = `embedded=true&theme=${theme}`

  return (
    <main
      className={cn('min-h-screen px-4 py-8 sm:px-8', roles.surface.canvas)}
    >
      <div className="mx-auto max-w-[1180px] space-y-6">
        <SegmentedControl
          presentation="text-only"
          value={width}
          onValueChange={(value) => setWidth(value as PreviewWidth)}
          aria-label="Preview viewport"
        >
          <SegmentedControlItem value="normal">Normal</SegmentedControlItem>
          <SegmentedControlItem value="narrow">Narrow</SegmentedControlItem>
          <SegmentedControlItem value="390">390px</SegmentedControlItem>
          <SegmentedControlItem value="320">320px</SegmentedControlItem>
        </SegmentedControl>

        {width === 'normal' || width === 'narrow' ? (
          <div
            data-testid={`preview-${width}`}
            className={cn(
              'mx-auto transition-[max-width]',
              width === 'normal' ? 'max-w-[1180px]' : 'max-w-[824px]'
            )}
          >
            <NextChartFamiliesReview />
          </div>
        ) : (
          <iframe
            key={`${mobileWidth}-${theme}`}
            title={`${mobileWidth}px mobile chart preview`}
            data-testid={`preview-mobile-${mobileWidth}`}
            src={`./preview.html#${iframeHash}`}
            className="mx-auto block min-h-[2200px] max-w-full border border-border bg-background"
            style={{ width: mobileWidth }}
          />
        )}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <Preview />
  </LanguageProvider>
)
