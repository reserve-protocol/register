import { Label } from '@/components/ui/label'
import { Switch, SwitchProps } from '@/components/ui/switch'

export function ManualOpsSwitch({
  label,
  ...props
}: { label: string } & SwitchProps) {
  return (
    <div className="flex items-center gap-[6px] px-3 py-2 rounded-xl border cursor-pointer">
      <Label htmlFor="manual-ops-switch" className="cursor-pointer text-legend">
        {label}
      </Label>
      <Switch
        id="manual-ops-switch"
        size="sm"
        className="data-[state=checked]:bg-black"
        {...props}
      />
    </div>
  )
}
