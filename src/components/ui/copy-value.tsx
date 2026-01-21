/**
 * CopyValue - Copy to clipboard button with tooltip
 * Maintains backward compatibility with old CopyValue API
 */
import { t } from '@lingui/macro'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'
import CopyIcon from 'components/icons/CopyIcon'
import { cn } from '@/lib/utils'

// Legacy theme-ui spacing to Tailwind mapping
const spacingMap: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '4',
  4: '6',
  5: '8',
}

interface CopyValueProps {
  text?: string
  value: string
  size?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  color?: string
  className?: string
  // Legacy theme-ui spacing props
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  mx?: number | string
  my?: number | string
}

const CopyValue = ({
  text,
  value,
  size = 16,
  side = 'left',
  color,
  className,
  ml,
  mr,
  mt,
  mb,
  mx,
  my,
}: CopyValueProps) => {
  const copyText = text || t`Copy to clipboard`
  const confirmText = t`Copied to clipboard!`
  const [displayText, setDisplayText] = useState(copyText)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setDisplayText(confirmText)
    setTimeout(() => setDisplayText(copyText), 2000)
  }

  // Build spacing classes from legacy props
  const getSpacingClass = (prefix: string, value?: number | string) => {
    if (value === undefined) return ''
    const numValue = typeof value === 'string' ? parseInt(value) : value
    const twValue = spacingMap[numValue] ?? numValue
    return `${prefix}-${twValue}`
  }

  const spacingClasses = [
    getSpacingClass('ml', ml ?? mx),
    getSpacingClass('mr', mr ?? mx),
    getSpacingClass('mt', mt ?? my),
    getSpacingClass('mb', mb ?? my),
  ].filter(Boolean)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center cursor-pointer p-0 w-auto h-auto',
            spacingClasses,
            className
          )}
          onClick={handleCopy}
          style={color ? { color } : undefined}
        >
          <CopyIcon />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>{displayText}</TooltipContent>
    </Tooltip>
  )
}

export default CopyValue
