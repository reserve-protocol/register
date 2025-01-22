import { cn } from '@/lib/utils'
import { useAtom, useSetAtom } from 'jotai'
import { Asterisk } from 'lucide-react'
import { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  selectedGovernanceOptionAtom,
  validatedSectionsAtom,
} from '../../atoms'
import GovernanceExistingERC20 from './form-existing-erc20'
import GovernanceExistingVoteLock from './form-existing-vote-lock'
import GovernanceSpecificWallet from './form-specific-wallet'

export type GovernanceTypes =
  | 'governanceERC20address'
  | 'governanceVoteLock'
  | 'governanceWalletAddress'

const GOVERNANCE_OPTIONS = [
  {
    type: 'governanceERC20address',
    title: 'Existing ERC20 token',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceExistingERC20 />,
    resetFields: ['governanceVoteLock', 'governanceWalletAddress'],
  },
  {
    type: 'governanceVoteLock',
    title: 'Existing Vote Lock contract',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean giving.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceExistingVoteLock />,
    resetFields: ['governanceERC20address', 'governanceWalletAddress'],
  },
  {
    type: 'governanceWalletAddress',
    title: 'Specific wallet address',
    description:
      'Explain the benefit of using our framwork & clarify that it doesn’t mean.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    form: <GovernanceSpecificWallet />,
    resetFields: [
      'governanceERC20address',
      'governanceVoteLock',
      'governanceShare',
    ],
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
}: GovernanceOptionProps) => (
  <div
    role="button"
    onClick={setSelected}
    className={cn(
      'flex flex-col gap-2 rounded-xl border border-border cursor-pointer',
      selected ? 'bg-muted' : 'bg-card'
    )}
  >
    <div className="flex items-center gap-2 p-4">
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
          className={cn('text-base font-bold', selected ? 'text-primary' : '')}
        >
          {title}
        </div>
        <div className="text-sm text-secondary-foreground/60">
          {description}
        </div>
      </div>
    </div>
    {selected && <div className="pb-4">{form}</div>}
  </div>
)

const GovernanceOptions = () => {
  const [selected, setSelected] = useAtom(selectedGovernanceOptionAtom)
  const setValidatedSections = useSetAtom(validatedSectionsAtom)
  const { resetField } = useFormContext()

  const onSelected = (selectedType: GovernanceTypes) => {
    const resetFields =
      GOVERNANCE_OPTIONS.find((option) => option.type === selected)
        ?.resetFields || []
    resetFields.forEach((field: string) => resetField(field))
    setValidatedSections((prev) => ({
      ...prev,
      'revenue-distribution': false,
    }))
    setSelected(selectedType)
  }

  return (
    <div className="mx-2 mb-2 flex flex-col gap-1">
      {GOVERNANCE_OPTIONS.map((option) => (
        <GovernanceOption
          key={option.title}
          {...option}
          selected={selected === option.type}
          setSelected={() => onSelected(option.type as GovernanceTypes)}
        />
      ))}
    </div>
  )
}

export default GovernanceOptions
