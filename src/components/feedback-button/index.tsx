import { ArrowUpRightIcon, MessageCirclePlus } from 'lucide-react'
import { Button } from '../ui/button'
import { REGISTER_FEEDBACK } from '@/utils/constants'

const FeedbackButton = () => {
  return (
    <div className="hidden lg:flex fixed bottom-4 left-4 z-50">
      <Button
        size="lg"
        variant="fab"
        className="flex items-center justify-center gap-1.5 rounded-full bg-[#021122] text-gray-50 px-5 py-3"
        onClick={() => {
          const referrer = window.location.href
          window.open(
            `${REGISTER_FEEDBACK}?ref=${encodeURIComponent(referrer)}`,
            '_blank'
          )
        }}
      >
        <MessageCirclePlus className="w-4 h-4" />
        <span>Feedback</span>
        <ArrowUpRightIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default FeedbackButton
