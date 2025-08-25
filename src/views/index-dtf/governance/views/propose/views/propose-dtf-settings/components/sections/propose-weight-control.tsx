import { Switch } from '@/components/ui/switch'
import { LandPlot } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

const ProposeWeightControl = () => {
  const { control } = useFormContext()

  return (
    <div className="w-full rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70">
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">
          <LandPlot size={14} strokeWidth={1.5} />
        </div>

        <div className="flex flex-col">
          <div className="text-base font-bold">Weight control</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Allowing the weight control will allow the rebalance to adjust the
            weights of the tokens in the basket, turning this off is recommended
            for tracking DTFs.
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

export default ProposeWeightControl