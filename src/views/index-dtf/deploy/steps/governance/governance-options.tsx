import { cn } from '@/lib/utils'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useAtom, useSetAtom } from 'jotai'
import { Asterisk, GlobeLock, Landmark, SearchCode, Wallet } from 'lucide-react'
import { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  selectedGovernanceOptionAtom,
  validatedSectionsAtom,
} from '../../atoms'
import Ticker from '../../utils/ticker'
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
    title: msg`Create a New DAO`,
    description: (
      <span>
        <Trans>
          Enter the contract address of an ERC-20 that can be vote-locked to
          govern <Ticker />.
        </Trans>
      </span>
    ),
    icon: <Landmark size={14} strokeWidth={1.5} />,
    form: <GovernanceExistingERC20 />,
    resetFields: ['governanceVoteLock', 'governanceWalletAddress'],
  },
  {
    type: 'governanceVoteLock',
    title: msg`Use an Existing DAO`,
    description: (
      <span>
        <Trans>
          Enter the contract address of an existing vote-lock DAO to govern{' '}
          <Ticker />. This DAO must have been created by the Reserve Index
          Protocol, and the contract must implement{' '}
          <a
            href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/utils/IVotes.sol"
            target="_blank"
            rel="noreferrer"
            className="text-primary"
          >
            IVotes.sol
          </a>
          .
        </Trans>
      </span>
    ),
    icon: <SearchCode size={14} strokeWidth={1.5} />,
    form: <GovernanceExistingVoteLock />,
    resetFields: ['governanceERC20address', 'governanceWalletAddress'],
  },
  {
    type: 'governanceWalletAddress',
    title: msg`Use an External Wallet`,
    description: (
      <span>
        <Trans>
          Enter the wallet address that will have centralized control of{' '}
          <Ticker />. Be aware, that having centralized control limits who can
          interact with <Ticker /> on Register.
        </Trans>
      </span>
    ),
    icon: <Wallet size={14} strokeWidth={1.5} />,
    form: <GovernanceSpecificWallet />,
    resetFields: [
      'governanceERC20address',
      'governanceVoteLock',
      'governanceShare',
    ],
  },
]

type GovernanceOptionProps = {
  title: MessageDescriptor
  description: ReactNode
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
  const { t } = useLingui()
  return (
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
          'rounded-full p-2 border border-foreground',
          selected && 'border-primary text-primary'
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <div
          className={cn('text-base font-bold', selected ? 'text-primary' : '')}
        >
          {t(title)}
        </div>
        <div className="text-sm text-secondary-foreground/60">
          {description}
        </div>
      </div>
    </div>
    {selected && <div className="pb-4">{form}</div>}
  </div>
  )
}

const GovernanceOptions = () => {
  const [selected, setSelected] = useAtom(selectedGovernanceOptionAtom)
  const setValidatedSections = useSetAtom(validatedSectionsAtom)
  const { resetField } = useFormContext()

  const onSelected = (selectedType: GovernanceTypes) => {
    const resetFields =
      GOVERNANCE_OPTIONS.find((option) => option.type === selectedType)
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
          key={option.type}
          {...option}
          selected={selected === option.type}
          setSelected={() => onSelected(option.type as GovernanceTypes)}
        />
      ))}
    </div>
  )
}

export default GovernanceOptions
