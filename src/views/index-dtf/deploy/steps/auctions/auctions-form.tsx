import { Switch } from '@/components/ui/switch'
import { humanizeMinutes } from '@/utils'
import { HandCoins, Hourglass, LandPlot } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import { Trans, useLingui } from '@lingui/react/macro'

const WeightControl = () => {
  const { control } = useFormContext()

  return (
    <div className="w-full rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70">
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">
          <LandPlot size={14} strokeWidth={1.5} />
        </div>

        <div className="flex flex-col">
          <div className="text-base font-bold">
            <Trans>Weight control</Trans>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trans>
              Allowing the weight control will allow the rebalance to adjust the
              weights of the tokens in the basket, turning this off is
              recommended for tracking DTFs.
            </Trans>
          </div>
        </div>

        <Controller
          name="weightControl"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch checked={value} onCheckedChange={onChange} />
          )}
        />
      </div>
    </div>
  )
}

const BidsEnabled = () => {
  const { control } = useFormContext()

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
            <Trans>Enable bids directly via the folio.</Trans>
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

const AuctionsForm = () => {
  const { t } = useLingui()

  const toggleForms = [
    {
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
    },
  ]

  return (
    <div className="flex flex-col gap-2 px-2 mb-2">
      {toggleForms.map((form) => (
        <ToggleGroupWithCustom key={form.fieldName} {...form} />
      ))}
      <BidsEnabled />
      <WeightControl />
    </div>
  )
}

export default AuctionsForm
