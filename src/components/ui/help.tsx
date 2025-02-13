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
}

const Help: React.FC<HelpProps> = ({ content, size = 12, side = 'top' }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <HelpCircle size={size} />
        </TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Help
