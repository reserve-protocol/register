import { humanizeMinutes } from '@/utils'
import { Asterisk } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

const TOGGLE_FORMS = [
  {
    title: 'Auction length',
    description:
      'How long dutch auctions will run when swapping tokens out of the basket.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    options: [1, 15, 30, 45, 60],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customFieldName: 'customAuctionLength',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
  },

  {
    title: 'Auction delay',
    description:
      'How long an auction can exist in an approved state while only launchable by an Auction Launcher.  Once the delay runs out, anyone can launch the auction.',
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
    <div className="flex flex-col gap-2 px-2 mb-2">
      {TOGGLE_FORMS.map((form) => (
        <ToggleGroupWithCustom key={form.fieldName} {...form} />
      ))}
    </div>
  )
}

export default AuctionsForm
