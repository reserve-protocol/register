import { Button } from '@/components/ui/button'
import BankIcon from 'components/icons/BankIcon'
import { ChevronLeft } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import SocialMediaInput from './SocialMediaInput'

const MintersModal = () => {
  const { showEliteProgramModal, setShowEliteProgramModal } = useZap()

  if (!showEliteProgramModal) return null

  return (
    <div
      className="animate-slide-out-right absolute hidden sm:flex flex-col justify-between top-0 right-0 w-[400px] h-full bg-secondary shadow-[0_0_0_3px_hsl(var(--border)),0px_10px_38px_6px_rgba(0,0,0,0.05)] pl-8 pr-6 py-6 rounded-tr-lg rounded-br-lg -z-[1]"
    >
      <div className="flex items-center text-primary-foreground gap-2 justify-between">
        <BankIcon />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEliteProgramModal(false)}
        >
          <div className="flex items-center gap-1">
            <ChevronLeft
              height={16}
              width={16}
              style={{ marginLeft: '-4px' }}
            />
            <span>Dismiss invitation</span>
          </div>
        </Button>
      </div>
      <div className="flex flex-col gap-4 max-w-[330px] leading-5">
        <span className="text-[28px] leading-7 font-bold text-primary">
          Congratulations 🎉
        </span>
        <span className="text-base">
          You've unlocked an invitation to Reserve Institutional's elite program
          for large RToken holders. Participants enjoy access to:
        </span>
        <ul className="flex flex-col gap-1 px-4 py-0 text-base mb-2">
          <li>1:1 support from Reserve Institutional</li>
          <li>Online & IRL invite-only events</li>
          <li>Exclusive alpha and insights</li>
        </ul>
        <SocialMediaInput />
      </div>
    </div>
  )
}

export default MintersModal
