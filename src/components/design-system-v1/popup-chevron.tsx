import { ChevronDown, type LucideProps } from 'lucide-react'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

export const popupTriggerPadding = {
  compactText: 'pl-3.5 pr-2.5',
  defaultText: 'pl-5 pr-[18px]',
} as const

export const popupTriggerGap = {
  compact: 'gap-2',
  default: 'gap-3',
} as const

export const PopupChevron = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, strokeWidth = 1.5, ...props }, ref) => (
    <ChevronDown
      ref={ref}
      aria-hidden="true"
      data-slot="popup-chevron"
      strokeWidth={strokeWidth}
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform duration-120 group-data-[state=open]:rotate-180 motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  )
)

PopupChevron.displayName = 'PopupChevron'
