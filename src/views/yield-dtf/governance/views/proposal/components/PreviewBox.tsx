import { Trans } from '@lingui/macro'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  count: number // number of changes
  title: string
  collapsed?: boolean
  children?: React.ReactNode
  className?: string
}

const PreviewBox = ({
  count,
  title,
  children,
  collapsed = true,
  className,
}: Props) => {
  const [visible, setVisible] = useState(!collapsed)

  return (
    <div className={className}>
      <div
        className={cn(
          'flex items-center cursor-pointer',
          visible ? 'border-b border-border pb-4' : ''
        )}
        onClick={() => setVisible(!visible)}
      >
        <div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">{count}</span>
            <span className="text-legend text-xs">
              <Trans>Change in:</Trans>
            </span>
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="ml-auto flex items-center">
          {visible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      {visible && children}
    </div>
  )
}

export default PreviewBox
