import { useFormContext } from 'react-hook-form'
import { GovernanceInputs } from '../schema'
import { humanizeMinutes } from '@/utils'
import { GalleryHorizontal, Hourglass } from 'lucide-react'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The Reserve Index Protocol uses dutch auctions any time when modifying token
    weights in the basket. A dutch auction is a type of auction where the token
    on sale starts at a high price, with the price lowering gradually until
    buyers place enough bids to fill the lot.
  </div>
)

const TOGGLE_FORMS = [
  {
    title: 'Auction length',
    description: `How long dutch auctions will run when swapping tokens out of the basket. Shorter auction lengths benefit from less market volatility affecting the price during the auction. Longer auctions benefit from having more time for discovering the best price when swapping two tokens.`,
    icon: <Hourglass size={14} strokeWidth={1.5} />,
    options: [15, 30, 60],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
  },
  {
    title: 'Exclusive Launch Window',
    description: `How long the exclusive launch window should be. During the exclusive launch window, auction launchers are the only people who can start a new auction. The exclusive launch window begins after a basket change is approved and the basket change's execution delay is completed.`,
    icon: <GalleryHorizontal size={14} strokeWidth={1.5} />,
    options: [0, 12, 24, 48],
    optionsFormatter: (option: number) =>
      option === 0 ? 'None' : `${option}h`,
    fieldName: 'auctionDelay',
    customLabel: 'hours',
    customPlaceholder: 'Enter custom length',
  },
]

const Auctions = () => {
  return (
    <>
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        {TOGGLE_FORMS.map((form) => (
          <ToggleGroupWithCustom key={form.fieldName} {...form} />
        ))}
      </div>
    </>
  )
}

export default Auctions
