import { Checkbox } from '@/components/ui/checkbox'
import { currentOptimisticAllowedActionsAtom } from '../../atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Clock, FileLock2, ShieldHalf, Wand2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { daysToSeconds, humanizeTimeFromSeconds } from '../../../../shared'
import { OPTIMISTIC_ACTIONS } from '../../optimistic'
import type { OptimisticActionId } from '../../optimistic'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Configure optimistic proposal parameters, trusted optimistic proposers,
      and which DTF settings they can propose through the veto flow.
    </Trans>
  </div>
)

const OptimisticActions = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const currentAllowedActions = useAtomValue(
    currentOptimisticAllowedActionsAtom
  )
  const { setValue, watch } = useFormContext()
  const selectedActions = (watch('optimisticActions') ??
    []) as OptimisticActionId[]
  const selectorRegistry =
    indexDTF?.ownerGovernance?.optimistic?.selectorRegistry
  const isLoading = !!selectorRegistry && currentAllowedActions === undefined

  const onToggle = (actionId: OptimisticActionId, checked: boolean) => {
    const nextActions = checked
      ? [...selectedActions, actionId]
      : selectedActions.filter((id) => id !== actionId)

    setValue('optimisticActions', nextActions, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  if (!selectorRegistry) {
    return (
      <div className="rounded-xl p-4 bg-muted/70 text-sm text-muted-foreground">
        <Trans>
          Selector registry is not available for this optimistic governor.
        </Trans>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70">
      <div className="flex items-center gap-2">
        <div className="p-2 border border-foreground rounded-full">
          <Wand2 size={14} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <div className="text-base font-bold">
            <Trans>Available optimistic actions</Trans>
          </div>
          <div className="text-sm text-muted-foreground">
            <Trans>
              Current DTF settings functions optimistic proposers can propose.
            </Trans>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">
          <Trans>Loading current allowed actions...</Trans>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {OPTIMISTIC_ACTIONS.map((action) => {
          const checked = selectedActions.includes(action.id)

          return (
            <label
              key={action.id}
              className="flex items-start gap-3 rounded-xl border bg-background/70 p-3"
            >
              <Checkbox
                checked={checked}
                disabled={isLoading}
                onCheckedChange={(value) => onToggle(action.id, value === true)}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{t(action.label)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(action.description)}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

const ProposeOptimisticParameters = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const governance = indexDTF?.ownerGovernance

  if (!governance?.isOptimistic) return null

  return (
    <div>
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        <ToggleGroupWithCustom
          title={t`Veto Delay`}
          icon={<Clock size={14} strokeWidth={1.5} />}
          options={[0.25, 0.5, 1]}
          optionsFormatter={(option) =>
            humanizeTimeFromSeconds(daysToSeconds(option))
          }
          customLabel={t`days`}
          customPlaceholder={t`Enter custom delay`}
          description={t`How long optimistic proposals wait before the veto period starts.`}
          fieldName="optimisticVetoDelay"
          inputProps={{ step: 0.1, min: 0 }}
          decimalPlaces={4}
        />
        <ToggleGroupWithCustom
          title={t`Veto Period`}
          icon={<Clock size={14} strokeWidth={1.5} />}
          options={[1, 1.5, 2]}
          optionsFormatter={(option) =>
            humanizeTimeFromSeconds(daysToSeconds(option))
          }
          customLabel={t`days`}
          customPlaceholder={t`Enter custom period`}
          description={t`How long governors have to veto an optimistic proposal.`}
          fieldName="optimisticVetoPeriod"
          inputProps={{ step: 0.1, min: 0 }}
          decimalPlaces={4}
        />
        <ToggleGroupWithCustom
          title={t`Veto Threshold`}
          icon={<FileLock2 size={14} strokeWidth={1.5} />}
          options={[0.5, 1, 2, 5]}
          optionsFormatter={(option) => formatPercentage(option)}
          customLabel="%"
          customPlaceholder={t`Enter custom threshold`}
          description={t`The optimistic voting power percentage required to veto.`}
          fieldName="optimisticVetoThreshold"
          inputProps={{ step: 0.01, min: 0, max: 100 }}
        />
        <InputWithTitle
          title={t`Optimistic Proposer`}
          description={t`A trusted actor that can create optimistic proposals.`}
          icon={<ShieldHalf size={14} strokeWidth={1.5} />}
          fieldName="optimisticProposers"
          buttonLabel={t`Add additional optimistic proposer`}
          inputLabel={t`Address`}
          placeholder="0x..."
        />
        <OptimisticActions />
      </div>
    </div>
  )
}

export default ProposeOptimisticParameters
