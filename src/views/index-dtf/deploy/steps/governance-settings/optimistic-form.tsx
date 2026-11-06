import { Checkbox } from '@/components/ui/checkbox'
import { humanizeTimeFromDays, humanizeTimeFromHours } from '@/utils'
import { getOptimisticActions } from '@/views/index-dtf/governance/views/propose/views/propose-dtf-settings/optimistic'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Clock,
  Coins,
  Gauge,
  ShieldHalf,
  Timer,
  UserCheck,
  Wand2,
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import InputWithTitle from '../../components/input-with-title'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

// Deploys are always Folio 6.0, so optimistic actions use the 6.0 selectors.
const ACTIONS = getOptimisticActions(6)

const OptimisticActions = () => {
  const { t } = useLingui()
  const { watch, setValue } = useFormContext()
  const selected = (watch('optimisticActions') ?? []) as string[]

  const toggle = (id: string, checked: boolean) =>
    setValue(
      'optimisticActions',
      checked ? [...selected, id] : selected.filter((value) => value !== id),
      { shouldDirty: true, shouldValidate: true }
    )

  return (
    <div className="w-full rounded-xl flex flex-col gap-3 p-4 bg-muted/70">
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">
          <Wand2 size={14} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <div className="text-base font-bold">
            <Trans>Optimistic actions</Trans>
          </div>
          <div className="text-sm text-muted-foreground">
            <Trans>
              Changes optimistic proposers can make without a vote, unless
              holders veto them. Leave all unchecked to require a vote for
              everything.
            </Trans>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ACTIONS.map((action) => (
          <label
            key={action.id}
            className="flex items-start gap-3 rounded-xl border bg-background/70 p-3"
          >
            <Checkbox
              data-testid={`deploy-optimistic-action-${action.id}`}
              checked={selected.includes(action.id)}
              onCheckedChange={(value) => toggle(action.id, value === true)}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t(action.label)}</span>
              <span className="text-xs text-muted-foreground">
                {t(action.description)}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export const OptimisticGovernanceForm = () => {
  const { t } = useLingui()

  const fields = [
    {
      title: t`Veto Delay`,
      icon: <Clock size={14} strokeWidth={1.5} />,
      options: [1, 4, 12, 24],
      optionsFormatter: (option: number) => humanizeTimeFromHours(option),
      customLabel: t`hours`,
      customPlaceholder: t`Enter custom length`,
      description: t`The time between an optimistic proposal being submitted and when holders can start vetoing it.`,
      fieldName: 'optimisticVetoDelay',
    },
    {
      title: t`Veto Period`,
      icon: <Timer size={14} strokeWidth={1.5} />,
      options: [12, 20, 24, 48],
      optionsFormatter: (option: number) => humanizeTimeFromHours(option),
      customLabel: t`hours`,
      customPlaceholder: t`Enter custom length`,
      description: t`How long holders have to veto an optimistic proposal. If no veto reaches the threshold, it passes.`,
      fieldName: 'optimisticVetoPeriod',
    },
    {
      title: t`Veto Threshold`,
      icon: <ShieldHalf size={14} strokeWidth={1.5} />,
      options: [1, 2, 5, 10],
      optionsFormatter: (option: number) => `${option}%`,
      customLabel: '%',
      customPlaceholder: t`Enter custom`,
      description: t`The share of governance power that must veto an optimistic proposal to send it to a full vote.`,
      fieldName: 'optimisticVetoThreshold',
    },
    {
      title: t`Proposals per 12 hours`,
      icon: <Gauge size={14} strokeWidth={1.5} />,
      options: [1, 3, 6, 12],
      optionsFormatter: (option: number) => option.toString(),
      customLabel: t`proposals`,
      customPlaceholder: t`Enter custom`,
      description: t`How many proposals each account can submit every 12 hours.`,
      fieldName: 'proposalThrottleCapacity',
    },
  ]

  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      {fields.map((form) => (
        <ToggleGroupWithCustom key={form.fieldName} {...form} />
      ))}
      <OptimisticActions />
      <InputWithTitle
        title={t`Optimistic proposers`}
        description={t`Accounts allowed to submit optimistic proposals.`}
        icon={<UserCheck size={14} strokeWidth={1.5} />}
        fieldName="optimisticProposers"
        buttonLabel={t`Add optimistic proposer`}
        inputLabel={t`Address`}
        placeholder="0x..."
      />
    </div>
  )
}

export const NewVaultForm = () => {
  const { t } = useLingui()

  const fields = [
    {
      title: t`Unstaking Delay`,
      icon: <Clock size={14} strokeWidth={1.5} />,
      options: [0, 3, 7, 14],
      optionsFormatter: (option: number) => humanizeTimeFromDays(option),
      customLabel: t`days`,
      customPlaceholder: t`Enter custom length`,
      description: t`How long a holder waits to withdraw after unlocking from the new vault.`,
      fieldName: 'vaultUnstakingDelay',
    },
    {
      title: t`Reward Half-life`,
      icon: <Coins size={14} strokeWidth={1.5} />,
      options: [3, 7, 14],
      optionsFormatter: (option: number) => humanizeTimeFromDays(option),
      customLabel: t`days`,
      customPlaceholder: t`Enter custom length`,
      description: t`How fast rewards stream to vault holders: half of any reward is paid out over this period.`,
      fieldName: 'vaultRewardHalfLife',
    },
  ]

  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      {fields.map((form) => (
        <ToggleGroupWithCustom key={form.fieldName} {...form} />
      ))}
    </div>
  )
}
