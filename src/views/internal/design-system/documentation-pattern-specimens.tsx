import { useLingui } from '@lingui/react/macro'
import { PresetOrCustomField } from '@/components/design-system-v1/preset-or-custom-field'

export const FormPatternSpecimen = () => {
  const { t } = useLingui()

  return (
    <div className="w-full max-w-3xl">
      <PresetOrCustomField
        accessibleLabel={t`Voting delay presets`}
        customAriaLabel={t`Custom voting delay`}
        customPlaceholder={t`Enter custom`}
        defaultValue="1"
        options={[
          { value: '0.5', label: t`12 hours` },
          { value: '1', label: t`1 day` },
          { value: '1.5', label: t`1.5 days` },
          { value: '2', label: t`2 days` },
        ]}
        trailing={t`days`}
      />
    </div>
  )
}
