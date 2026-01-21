import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Spinner from '@/components/ui/spinner'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RevenueBoxContainerProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  btnLabel?: string
  muted?: boolean
  defaultOpen?: boolean
  loading?: boolean
  right?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const RevenueBoxContainer = ({
  icon,
  title,
  subtitle,
  muted,
  children,
  defaultOpen,
  btnLabel = 'Inspect',
  loading = false,
  right,
  className,
}: RevenueBoxContainerProps) => {
  const [expanded, setExpanded] = useState(!!defaultOpen)

  return (
    <Card className={cn('p-0 border border-border bg-muted', className)}>
      <div className="p-4 flex items-center">
        <div
          className={cn('mx-2 w-[22px]', !muted ? 'text-primary' : 'text-muted-foreground')}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-base sm:text-lg font-medium">{title}</span>
          </div>
          {loading ? (
            <Spinner size={16} />
          ) : (
            <span className="text-sm sm:text-base">{subtitle}</span>
          )}
        </div>
        {right ? (
          right
        ) : (
          <Button
            className="ml-auto flex shrink-0 items-center"
            size="sm"
            variant={!muted ? 'default' : 'secondary'}
            disabled={!!loading}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-xs sm:text-sm mr-2">{btnLabel}</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}
      </div>
      {expanded && (
        <>
          <Separator className="m-0" />
          <div className="p-4 pt-0">{children}</div>
        </>
      )}
    </Card>
  )
}

export default RevenueBoxContainer
