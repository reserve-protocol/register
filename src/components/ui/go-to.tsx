/**
 * GoTo - External link button with arrow icon
 */
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
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

interface GoToProps {
  href?: string
  color?: string
  className?: string
  style?: React.CSSProperties
  // Legacy theme-ui spacing props
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  mx?: number | string
  my?: number | string
}

const GoTo = ({ href, color, className, style, ml, mr, mt, mb, mx, my, ...props }: GoToProps) => {
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center cursor-pointer',
        spacingClasses,
        className
      )}
      style={style}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <span
        className={cn(
          'flex items-center hover:text-foreground',
          color ? `text-[${color}]` : 'text-muted-foreground'
        )}
      >
        <ExternalArrowIcon strokeWidth={1.5} />
      </span>
    </a>
  )
}

export default GoTo
