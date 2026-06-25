import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight, Circle } from 'lucide-react'
import { ReactNode } from 'react'

export type HeaderNavItem = {
  label: string
  description?: string
  icon: ReactNode
  to: string
  external?: boolean
  mobileOnly?: boolean
}

export const headerNavItemClassName =
  'group flex items-center gap-2 border border-transparent bg-card p-4 transition-colors hover:bg-background'

export const headerNavIconClassName =
  'transition-colors group-hover:text-primary'

export const HeaderNavItemContent = ({
  item,
  isActive,
  showDescription = true,
  activeTone = 'primary',
}: {
  item: HeaderNavItem
  isActive?: boolean
  showDescription?: boolean
  activeTone?: 'primary' | 'muted'
}) => (
  <>
    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
      {item.icon}
    </div>
    <div className="mr-auto min-w-0">
      <span
        className={cn(
          'block text-base font-medium transition-colors group-hover:text-primary',
          isActive && activeTone === 'primary' && 'text-primary',
          isActive && activeTone === 'muted' && 'text-legend'
        )}
      >
        {item.label}
      </span>
      {showDescription && item.description && (
        <p className="text-sm text-legend">{item.description}</p>
      )}
    </div>
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground',
        isActive && activeTone === 'muted' && 'bg-background text-legend'
      )}
    >
      {item.external ? (
        <ArrowUpRight size={16} />
      ) : isActive ? (
        <Circle size={8} fill="currentColor" strokeWidth={0} />
      ) : (
        <ArrowRight size={16} />
      )}
    </div>
  </>
)
