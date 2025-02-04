import { cn } from '@/lib/utils'
import { Asterisk, Check } from 'lucide-react'
import { ReactNode } from 'react'

interface TimelineItem {
  title: string
  isActive?: boolean
  rightText?: ReactNode
  children?: ReactNode
  isCompleted?: boolean
}

interface TimelineProps {
  items: TimelineItem[]
}

const Timeline = ({ items }: TimelineProps) => {
  return (
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-[2px] top-2 h-[calc(100%-16px)] w-px bg-gray-200" />

      {/* Timeline items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="relative flex items-bottom">
            {/* Circle marker */}
            <div
              className={cn(
                'absolute left-[-24px] h-[22px] w-[22px] rounded-full border-2 border-gray-200 bg-white',
                (item.isActive || item.isCompleted) &&
                  'border-primary/10 bg-[#E4E9EF]'
              )}
            >
              {item.isActive && (
                <Asterisk className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
              )}
              {item.isCompleted && (
                <Check className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between px-1">
                {item.children ? (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-base">{item.title}</span>
                    {item.children}
                  </div>
                ) : (
                  <>
                    <div className="text-base">{item.title}</div>
                    {item.rightText && (
                      <div className="text-gray-500">{item.rightText}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
