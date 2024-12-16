import { Asterisk } from 'lucide-react'
import { ReactNode } from 'react'

interface TimelineItem {
  title: string
  isActive?: boolean
  rightText?: string
  children?: ReactNode
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
          <div key={index} className="relative flex items-center">
            {/* Circle marker */}
            <div className="absolute left-[-24px] h-[22px] w-[22px] rounded-full border-2 border-gray-200 bg-white">
              {item.isActive && (
                <Asterisk className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between px-1">
                {item.children ? (
                  item.children
                ) : (
                  <>
                    <span className="text-base">{item.title}</span>
                    {item.rightText && (
                      <span className="text-gray-500">{item.rightText}</span>
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