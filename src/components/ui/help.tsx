import React, { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { HelpCircle } from 'lucide-react'

interface HelpProps {
  content: ReactNode
  size?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

const Help: React.FC<HelpProps> = ({
  content,
  size = 12,
  side = 'top',
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <HelpCircle size={size} className={className} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Help
