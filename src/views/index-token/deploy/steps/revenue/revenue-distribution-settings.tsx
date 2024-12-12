import { Asterisk } from 'lucide-react'
import BasicInput from '../basket/basic-input'

const SETTINGS = [
  {
    title: 'Governance share',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    field: 'governanceShare',
  },
  {
    title: 'Deployer share',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    field: 'deployerShare',
  },
  {
    title: 'Fixed platform fee',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    field: 'fixedPlatformFee',
  },
]

const RevenueDistributionSettings = () => {
  return (
    <div className="flex flex-col gap-2 mx-2 mb-2">
      {SETTINGS.map(({ title, description, field }) => (
        <div
          className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted/70"
          key={title}
        >
          <div className="flex items-center gap-2">
            <div className="bg-muted-foreground/10 rounded-full">
              <Asterisk size={32} strokeWidth={1.5} />
            </div>

            <div className="flex flex-col">
              <div className="text-base font-bold">{title}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {description}
              </div>
            </div>
          </div>
          <BasicInput
            className="max-w-32"
            fieldName={field}
            label="%"
            placeholder="0"
            defaultValue={0}
          />
        </div>
      ))}
    </div>
  )
}

export default RevenueDistributionSettings
