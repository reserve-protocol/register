import { useLingui } from '@lingui/react/macro'
import { CopyIcon } from 'lucide-react'
import React, { useState } from 'react'
import { isAddress } from '@/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

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
  const { t } = useLingui()
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const displayText = isCopied ? t`Copied to clipboard!` : t`Copy to clipboard`

  const handleCopy = () => {
    navigator.clipboard.writeText(isAddress(value) || value)
    setIsCopied(true)
    setIsOpen(true)
    setTimeout(() => {
      setIsCopied(false)
      setIsOpen(false)
    }, 2000) // Reset after 2 seconds
  }

  return (
    <Tooltip open={isOpen ? true : undefined} delayDuration={0}>
      <TooltipTrigger onClick={handleCopy}>
        <CopyIcon size={size} className={className} />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {displayText}
      </TooltipContent>
    </Tooltip>
  )
}

export default Copy
