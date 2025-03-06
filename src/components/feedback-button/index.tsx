import { ArrowUpRightIcon, MessageCirclePlus } from 'lucide-react'
import { Button } from '../ui/button'
import { REGISTER_FEEDBACK } from '@/utils/constants'

const FeedbackButton = () => {
  return (
    <div className="z-50">
      <Button
        size="lg"
        variant="fab"
        className="flex items-center justify-center gap-1.5 rounded-full bg-[#021122] text-gray-50 px-3 py-1 sm:px-5 sm:py-3 h-9 sm:h-10"
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
