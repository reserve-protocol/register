import { t } from '@lingui/macro'
import { CopyIcon } from 'lucide-react'
import React, { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

interface CopyProps {
  value: string
  size?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

const Copy: React.FC<CopyProps> = ({
  value,
  size = 12,
  side = 'top',
  className,
}) => {
  const copyText = t`Copy to clipboard`
  const confirmText = t`Copied to clipboard!`
  const [displayText, setDisplayText] = useState(copyText)
  const [isOpen, setIsOpen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setDisplayText(confirmText)
    setIsOpen(true)
    setTimeout(() => {
      setDisplayText(copyText)
      setIsOpen(false)
    }, 2000) // Reset after 2 seconds
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen ? true : undefined} delayDuration={0}>
        <TooltipTrigger onClick={handleCopy}>
          <CopyIcon size={size} className={className} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {displayText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Copy
