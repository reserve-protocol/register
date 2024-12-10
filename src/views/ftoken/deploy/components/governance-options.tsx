import { cn } from '@/lib/utils'
import { Asterisk } from 'lucide-react'
import { ReactNode, useState } from 'react'
import GovernanceNewERC20 from './forms/governance-new-erc20'
import GovernanceExistingERC20 from './forms/governance-existing-erc20'
import GovernanceSpecificWallet from './forms/governance-specific-wallet'
import { useFormContext } from 'react-hook-form'

const GOVERNANCE_OPTIONS = [
  {
    title: 'New ERC20 token',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean giving.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceNewERC20 />,
    fields: ['governanceERC20name', 'governanceERC20symbol'],
  },
  {
    title: 'Existing ERC20 token',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceExistingERC20 />,
    fields: ['governanceERC20address'],
  },
  {
    title: 'Specific wallet address',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceSpecificWallet />,
    fields: ['governanceWalletAddress'],
  },
]

type GovernanceOptionProps = {
  title: string
  description: string
  icon: ReactNode
  form: ReactNode
  selected: boolean
  setSelected: () => void
}

const GovernanceOption = ({
  title,
  description,
  icon,
  form,
  selected,
  setSelected,
}: GovernanceOptionProps) => {
  const { resetField } = useFormContext()

  const resetNotSelected = () => {
    GOVERNANCE_OPTIONS.forEach((option) => {
      if (option.title !== title) {
        option.fields.forEach((field: string) => resetField(field))
      }
    })
  }

  const onSelect = () => {
    setSelected()
    resetNotSelected()
  }

  return (
    <div
      role="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border cursor-pointer',
        selected ? 'bg-muted' : 'bg-card'
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <div
          className={cn(
            'rounded-full p-1',
            selected ? 'bg-primary text-white' : 'bg-muted-foreground/10'
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <div
            className={cn(
              'text-base font-bold',
              selected ? 'text-primary' : ''
            )}
          >
            {title}
          </div>
          <div className="text-sm text-secondary-foreground/60">
            {description}
          </div>
        </div>
      </div>
      {selected && <div className="pb-3">{form}</div>}
    </div>
  )
}

const GovernanceOptions = () => {
  const [selected, setSelected] = useState<number>(0)

  return (
    <div className="mx-2 mb-2 flex flex-col gap-1">
      {GOVERNANCE_OPTIONS.map((option, index) => (
        <GovernanceOption
          key={option.title}
          {...option}
          selected={index === selected}
          setSelected={() => setSelected(index)}
        />
      ))}
    </div>
  )
}

export default GovernanceOptions
