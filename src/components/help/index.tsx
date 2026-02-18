import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import HelpIcon from 'components/icons/CustomHelpIcon'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

// Legacy theme-ui spacing to Tailwind mapping
// theme-ui: [0, 4, 8, 16, 24, 32, 40, 48, 80, 256]
const spacingMap: Record<number, string> = {
  0: '0',
  1: '1', // 4px
  2: '2', // 8px
  3: '4', // 16px
  4: '6', // 24px
  5: '8', // 32px
}

// Map placement (from @popperjs/core) to side
const placementToSide = (
  placement?: string
): 'top' | 'right' | 'bottom' | 'left' => {
  if (placement?.startsWith('bottom')) return 'bottom'
  if (placement?.startsWith('left')) return 'left'
  if (placement?.startsWith('right')) return 'right'
  return 'top'
}

interface Props {
  content: ReactNode
  size?: number
  color?: string
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  // Legacy theme-ui props (will be converted to Tailwind classes)
  placement?: string
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  mx?: number | string
  my?: number | string
  sx?: Record<string, unknown> // Ignored, just for compatibility
}

const Help = ({
  content,
  color,
  size = 16,
  className,
  side,
  placement,
  ml,
  mr,
  mt,
  mb,
  mx,
  my,
  sx, // eslint-disable-line @typescript-eslint/no-unused-vars
}: Props) => {
  const [open, setOpen] = useState(false)
  const defaultColor = 'secondaryText'

  // Build Tailwind classes from legacy props
  const legacyClasses: string[] = []

  const addSpacing = (
    prefix: string,
    value: number | string | undefined
  ) => {
    if (value === undefined) return
    const numValue = typeof value === 'string' ? parseInt(value) : value
    const twValue = spacingMap[numValue] ?? value
    legacyClasses.push(`${prefix}-${twValue}`)
  }

  addSpacing('ml', ml ?? mx)
  addSpacing('mr', mr ?? mx)
  addSpacing('mt', mt ?? my)
  addSpacing('mb', mb ?? my)

  const finalSide = side ?? placementToSide(placement)

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center cursor-pointer',
              legacyClasses.join(' '),
              className
            )}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <HelpIcon color={color ? color : defaultColor} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={finalSide} className="max-w-[340px]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Help
