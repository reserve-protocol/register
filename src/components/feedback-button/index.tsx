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
          'fixed bottom-[4.5rem] sm:bottom-4 right-3 sm:right-4 shadow-lg flex items-center justify-center gap-1.5 rounded-full bg-[#021122] text-gray-50 px-3 py-1 sm:px-5 sm:py-3 h-9 sm:h-10',
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
        <MessageCirclePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Feedback</span>
        <ArrowUpRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  )
}

export default FeedbackButton
