import { humanizeMinutes } from '@/utils'
import { Asterisk } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import InputWithTitle from '../../components/input-with-title'
import AdditionalAuctionLaunchers from './additional-auction-launchers'

const TOGGLE_FORMS = [
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
    title: 'Auction delay',
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

const INPUT_FORMS = [
  {
    title: 'Auction launcher',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'auctionLauncher',
    label: 'Address',
    placeholder: '0x...',
  },
]

const AuctionsForm = () => {
  return (
    <div className="px-2 mb-2">
      <div className="flex flex-col gap-2">
        {TOGGLE_FORMS.map((form) => (
          <ToggleGroupWithCustom key={form.fieldName} {...form} />
        ))}
        {INPUT_FORMS.map((form) => (
          <InputWithTitle key={form.fieldName} {...form}>
            <AdditionalAuctionLaunchers />
          </InputWithTitle>
        ))}
      </div>
    </div>
  )
}

export default AuctionsForm
