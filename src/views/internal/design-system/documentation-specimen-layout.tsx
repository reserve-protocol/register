import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const DocumentationSpecimenGrid = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'grid w-full min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3',
      className
    )}
  >
    {children}
  </div>
)

export const DocumentationSpecimenCell = ({
  children,
  label,
  className,
}: {
  children: ReactNode
  label: ReactNode
  className?: string
}) => (
  <div className={cn('min-w-0', className)}>
    <p className="mb-2 text-xs leading-4 text-muted-foreground">{label}</p>
    {children}
  </div>
)
