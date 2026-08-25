import { useState } from 'react'

import { Switch } from '@/components/design-system-v1/switch'

const SwitchStateSheet = () => {
  const [checked, setChecked] = useState(true)
  const [unchecked, setUnchecked] = useState(false)

  return (
    <section data-testid="switch-state-sheet" className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">
          Accepted current baseline
        </p>
        <h2 className="mt-1 text-xl font-medium">Immediate boolean setting</h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          The switch is 36×20px with a 16px thumb. Its surrounding row or label
          owns the larger 44px interaction target. Disabled states preserve the
          stored position with inverse neutral contrast while replacing active
          color and elevation; async recovery is not part of this candidate.
        </p>
      </div>
      <div className="flex flex-wrap gap-8 border border-border bg-card p-5">
        <SwitchExample
          label="Governance alerts"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <SwitchExample
          label="Unchecked"
          checked={unchecked}
          onCheckedChange={setUnchecked}
        />
        <SwitchExample label="Disabled on" checked disabled />
        <SwitchExample label="Disabled off" checked={false} disabled />
      </div>
    </section>
  )
}

const SwitchExample = ({
  label,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) => (
  <label className="flex min-h-11 items-center gap-2 text-sm font-light">
    <Switch
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    />
    {label}
  </label>
)

export default SwitchStateSheet
