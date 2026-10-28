import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  count: number // number of changes
  title: string
  collapsed?: boolean
  children?: React.ReactNode
  className?: string
  testId?: string
}

const PreviewBox = ({
  count,
  title,
  children,
  collapsed = true,
  className,
  testId,
}: Props) => {
  const [visible, setVisible] = useState(!collapsed)

  return (
    <div className={className} data-testid={testId}>
      <button
        type="button"
        aria-expanded={visible}
        className={cn(
          'flex w-full items-center text-left cursor-pointer',
          visible ? 'border-b border-border pb-4' : ''
        )}
        onClick={() => setVisible(!visible)}
      >
        <span className="block">
          <span className="flex items-center">
            <span className="font-semibold mr-2">{count}</span>
            <span className="text-legend text-xs">
              <Trans>Change in:</Trans>
            </span>
          </span>
          <span className="block font-semibold">{title}</span>
        </span>
        <span className="ml-auto flex items-center">
          {visible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {visible && children}
    </div>
  )
}

export default PreviewBox
