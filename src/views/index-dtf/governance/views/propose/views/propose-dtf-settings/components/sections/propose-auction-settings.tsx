import { Switch } from '@/components/ui/switch'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import { humanizeMinutes } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { HandCoins, Hourglass } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import ProposeWeightControl from './propose-weight-control'

const ProposeBidsEnabled = () => {
  const { control } = useFormContext()
  const version = useAtomValue(indexDTFVersionAtom)
  const isV5 = version?.startsWith('5') ?? false

  if (!isV5) return null

  return (
    <div className="w-full rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70">
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">
          <HandCoins size={14} strokeWidth={1.5} />
        </div>

        <div className="flex flex-col">
          <div className="text-base font-bold">
            <Trans>Permissionless Bids</Trans>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trans>Enable bids directly from the DTF.</Trans>
          </div>
        </div>

        <Controller
          name="bidsEnabled"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch checked={value} onCheckedChange={onChange} />
          )}
        />
      </div>
    </div>
  )
}

const ProposeAuctionSettings = () => {
  const { t } = useLingui()

  const auctionLengthForm = {
    title: t`Auction length`,
    description: t`How long dutch auctions will run when swapping tokens out of the basket. Shorter auction lengths benefit from less market volatility affecting the price during the auction. Longer auctions benefit from having more time for discovering the best price when swapping two tokens.`,
    icon: <Hourglass size={14} strokeWidth={1.5} />,
    options: [15, 30, 45],
    optionsFormatter: (option: number) => humanizeMinutes(option),
    fieldName: 'auctionLength',
    customLabel: t`minutes`,
    customPlaceholder: t`Enter custom length`,
    inputProps: {
      max: 45,
    },
  }

  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      <ToggleGroupWithCustom {...auctionLengthForm} />
      <ProposeBidsEnabled />
      <ProposeWeightControl />
    </div>
  )
}

export default ProposeAuctionSettings
