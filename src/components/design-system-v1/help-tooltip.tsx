import { CircleHelp } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface HelpTooltipProps {
  accessibleLabel: string
  className?: string
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export const HelpTooltip = ({
  accessibleLabel,
  className,
  content,
  side = 'top',
}: HelpTooltipProps) => {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={accessibleLabel}
            className={cn(
              'relative inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 after:absolute after:-inset-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              className
            )}
            onClick={() => setOpen((current) => !current)}
          >
            <CircleHelp
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.5}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={8}
          collisionPadding={8}
          className="max-w-[min(340px,var(--radix-tooltip-content-available-width))] rounded-lg border-border px-3 py-2 text-sm font-light leading-5 shadow-sm motion-reduce:animate-none"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
