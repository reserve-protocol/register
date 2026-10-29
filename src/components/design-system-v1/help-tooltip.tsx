import { CircleHelp } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { tooltipSurfaceRecipe } from './tooltip-surface'

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
              'relative inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 after:absolute after:-inset-3 hover:text-foreground focus-visible:outline-none',
              roles.focus.visibleOnContent,
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
          className={tooltipSurfaceRecipe}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
