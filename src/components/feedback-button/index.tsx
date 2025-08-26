import { ArrowUpRightIcon, MessageCirclePlus } from 'lucide-react'
import { Button } from '../ui/button'
import { REGISTER_FEEDBACK } from '@/utils/constants'
import { cn } from '@/lib/utils'

const FeedbackButton = ({ className }: { className?: string }) => {
  return (
    <div className="z-50">
      <Button
        size="lg"
        className={cn(
          'fixed bottom-[4.5rem] lg:bottom-4 right-3 lg:right-4 shadow-lg flex items-center justify-center gap-1.5 rounded-full bg-[#021122] text-gray-50 px-3 py-1 lg:px-5 lg:py-3 h-9 lg:h-10',
          className
        )}
        onClick={() => {
          const referrer = window.location.href
          window.open(
            `${REGISTER_FEEDBACK}?ref=${encodeURIComponent(referrer)}`,
            '_blank'
          )
        }}
      >
        <MessageCirclePlus className="w-4 h-4" />
        <span className="text-xs lg:text-sm ">Feedback</span>
        <ArrowUpRightIcon className="w-3.5 h-3.5 lg:w-4 sm:h-4 hidden lg:block" />
      </Button>
    </div>
  )
}

export default FeedbackButton
