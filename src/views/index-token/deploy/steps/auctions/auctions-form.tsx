import { humanizeMinutes } from '@/utils'
import { Asterisk } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

const FORMS = [
  {
    title: 'Auction length',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    options: [0, 15, 30, 45, 60],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customFieldName: 'customAuctionLength',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
  },

  {
    title: 'Voting Quorum',
    description:
      'Amount of time until auctions can be permissionlessly executed, bypassing the auction launcher',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    options: [0, 15, 30, 45, 60],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionDelay',
    customFieldName: 'customAuctionDelay',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
  },
]

const AuctionsForm = () => {
  return (
    <div className="px-2 mb-2">
      <div className="flex flex-col gap-2">
        {FORMS.map((form) => (
          <ToggleGroupWithCustom key={form.fieldName} {...form} />
        ))}
      </div>
    </div>
  )
}

export default AuctionsForm
