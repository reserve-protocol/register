import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const OrganicBrandSurface = ({
  className,
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: 'default' | 'deep' }) => (
  <div
    {...props}
    aria-hidden="true"
    data-component="organic-brand-surface"
    data-tone={tone}
    className={cn(
      'organic-brand-surface pointer-events-none relative isolate overflow-hidden bg-brand',
      tone === 'deep' && 'organic-brand-surface--deep bg-brand-deep',
      className
    )}
  >
    <span className="organic-brand-surface__field organic-brand-surface__field--cyan" />
    <span className="organic-brand-surface__field organic-brand-surface__field--violet" />
    <span className="organic-brand-surface__field organic-brand-surface__field--glow" />
  </div>
)
