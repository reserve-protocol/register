import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const OrganicBrandSurface = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    aria-hidden="true"
    data-component="organic-brand-surface"
    className={cn(
      'organic-brand-surface pointer-events-none relative isolate overflow-hidden bg-brand',
      className
    )}
  >
    <span className="organic-brand-surface__field organic-brand-surface__field--cyan" />
    <span className="organic-brand-surface__field organic-brand-surface__field--violet" />
    <span className="organic-brand-surface__field organic-brand-surface__field--glow" />
  </div>
)
