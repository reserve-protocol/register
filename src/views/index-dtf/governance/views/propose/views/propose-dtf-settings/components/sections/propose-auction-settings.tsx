import { humanizeMinutes } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Hourglass } from 'lucide-react'
import ProposeWeightControl from './propose-weight-control'

const TOGGLE_FORMS = [
  {
    title: 'Auction length',
    description: `How long dutch auctions will run when swapping tokens out of the basket. Shorter auction lengths benefit from less market volatility affecting the price during the auction. Longer auctions benefit from having more time for discovering the best price when swapping two tokens.`,
    icon: <Hourglass size={14} strokeWidth={1.5} />,
    options: [15, 30, 45],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customLabel: 'minutes',
    customPlaceholder: 'Enter custom length',
    inputProps: {
      max: 45,
    },
  },
]

const ProposeAuctionSettings = () => {
  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      <ToggleGroupWithCustom {...TOGGLE_FORMS[0]} />
      <ProposeWeightControl />
    </div>
  )
}

export default ProposeAuctionSettings
