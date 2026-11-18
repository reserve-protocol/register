import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const MobileField = ({
  label,
  children,
  className,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) => (
  <span className={cn('flex min-w-0 flex-col', className)}>
    <span className="text-[11px] text-legend">{label}</span>
    <span className="truncate text-sm font-medium">{children}</span>
  </span>
)

export default MobileField
