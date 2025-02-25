import { humanizeMinutes } from '@/utils'
import { Asterisk, GalleryHorizontal, Hourglass } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

const TOGGLE_FORMS = [
  {
    title: 'Auction length',
    description: `How long dutch auctions will run when swapping tokens out of the basket. Shorter auction lengths benefit from less market volatility effecting the price during the auction. Longer auctions benefit from having more time for discovering the best price when swapping two tokens.`,
    icon: <Hourglass size={14} strokeWidth={1.5} />,
    options: [15, 30, 60],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
  },

  {
    title: 'Exclusive Launch Window',
    description: `How long should the exclusive launch window be? During the exclusive launch window, auction launchers are the only people who can start a new auction. The exclusive launch window start after after a basket change is approved and the basket change’s execution delay is completed.`,
    icon: <GalleryHorizontal size={14} strokeWidth={1.5} />,
    options: [0, 12, 24, 48],
    optionsFormatter: (option: number) =>
      option === 0 ? 'None' : `${option}h`,
    fieldName: 'auctionDelay',
    customLabel: 'hours',
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
