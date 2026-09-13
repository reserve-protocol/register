import { type ReactNode } from 'react'
import { Skeleton } from '@/components/design-system-v1/loading'
import { cn } from '@/lib/utils'

export function RecordPlaceholder({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span aria-hidden="true" className="relative block">
      <span className="invisible">{children}</span>
      <Skeleton
        className={cn('absolute left-0 top-1 h-4 w-32 max-w-full', className)}
      />
    </span>
  )
}
