import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileLock2,
  MinusCircle,
  PlusCircle,
  ShieldHalf,
  Undo,
  Wand2,
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import {
  currentOptimisticAllowedActionsAtom,
  hasOptimisticGovernanceChangesAtom,
  optimisticGovernanceChangesAtom,
} from '../../atoms'
import {
  DEFAULT_OPTIMISTIC_VETO_DELAY,
  DEFAULT_OPTIMISTIC_VETO_PERIOD,
  DEFAULT_OPTIMISTIC_VETO_THRESHOLD,
  getOptimisticActionById,
} from '../../optimistic'
import type {
  OptimisticActionId,
  OptimisticGovernanceChanges as OptimisticGovernanceChangesData,
} from '../../optimistic'
import { ChangeSection, RevertButton } from './shared'
import { humanizeTimeFromSeconds, secondsToDays } from '../../../../shared'

const ParamChange = ({
  icon,
  title,
  current,
  next,
  onRevert,
}: {
  icon: React.ReactNode
  title: string
  current: string
  next: string
  onRevert: () => void
}) => (
  <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
    {icon}
    <div className="mr-auto">
      <div className="text-sm font-medium">{title}</div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">{current}</span>
        <ArrowRight size={16} className="text-primary" />
        <span className="text-primary font-medium">{next}</span>
      </div>
    </div>
    <RevertButton size="icon-rounded" onClick={onRevert} />
  </div>
)

const ListChangeItem = ({
  label,
  type,
  onRevert,
  href,
}: {
  label: string
  type: 'add' | 'remove'
  onRevert: () => void
  href?: string
}) => (
  <div className="flex items-center gap-2 border rounded-2xl p-2">
    {type === 'add' ? (
      <PlusCircle className="text-success" size={16} />
    ) : (
      <MinusCircle className="text-destructive" size={16} />
    )}
    <div className="flex flex-col gap-1 mr-auto">
      <h4
        className={cn(
          'text-sm',
          type === 'add' ? 'text-success' : 'text-destructive'
        )}
      >
        {type === 'add' ? <Trans>Added</Trans> : <Trans>Removed</Trans>}
      </h4>
      {href ? (
        <Link
          className="text-sm text-legend flex items-center gap-1"
          to={href}
          target="_blank"
        >
          {label}
          <ArrowUpRight size={12} />
        </Link>
      ) : (
        <span className="text-sm text-legend">{label}</span>
      )}
    </div>
    <Button
      variant="outline"
      size="xs"
      className="rounded-full"
      onClick={onRevert}
    >
      <Undo size={12} />
    </Button>
  </div>
)

const OptimisticGovernanceChanges = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const currentAllowedActions = useAtomValue(
    currentOptimisticAllowedActionsAtom
  )
  const [changes, setChanges] = useAtom(optimisticGovernanceChangesAtom)
  const hasChanges = useAtomValue(hasOptimisticGovernanceChangesAtom)
  const { setValue } = useFormContext()
  const governance = indexDTF?.ownerGovernance

  if (!hasChanges || !governance?.isOptimistic) return null

  const optimistic = governance.optimistic
  const currentVetoDelay =
    optimistic?.vetoDelay ?? DEFAULT_OPTIMISTIC_VETO_DELAY
  const currentVetoPeriod =
    optimistic?.vetoPeriod ?? DEFAULT_OPTIMISTIC_VETO_PERIOD
  const currentVetoThreshold =
    optimistic?.vetoThreshold ?? DEFAULT_OPTIMISTIC_VETO_THRESHOLD
  const currentProposers = governance.optimistic?.proposers ?? []
  const currentActions = currentAllowedActions ?? []

  const onRevertParam = (field: keyof OptimisticGovernanceChangesData) => {
    const nextChanges = { ...changes }
    delete nextChanges[field]
    setChanges(nextChanges)

    if (field === 'vetoDelay') {
      setValue('optimisticVetoDelay', secondsToDays(currentVetoDelay))
    }
    if (field === 'vetoPeriod') {
      setValue('optimisticVetoPeriod', secondsToDays(currentVetoPeriod))
    }
    if (field === 'vetoThreshold') {
      setValue('optimisticVetoThreshold', currentVetoThreshold)
    }
  }

  const onRevertProposerAdd = (address: string) => {
    const nextProposers = (changes.optimisticProposers ?? []).filter(
      (proposer) => proposer.toLowerCase() !== address.toLowerCase()
    )
    setChanges({ ...changes, optimisticProposers: nextProposers })
    setValue('optimisticProposers', nextProposers)
  }

  const onRevertProposerRemove = (address: string) => {
    const nextProposers = [
      ...(changes.optimisticProposers ?? []),
      address as Address,
    ]
    setChanges({ ...changes, optimisticProposers: nextProposers })
    setValue('optimisticProposers', nextProposers)
  }

  const onRevertAllProposers = () => {
    const nextChanges = { ...changes }
    delete nextChanges.optimisticProposers
    setChanges(nextChanges)
    setValue('optimisticProposers', currentProposers)
  }

  const onRevertActionAdd = (actionId: OptimisticActionId) => {
    const nextActions = (changes.allowedActions ?? []).filter(
      (id) => id !== actionId
    )
    setChanges({ ...changes, allowedActions: nextActions })
    setValue('optimisticActions', nextActions)
  }

  const onRevertActionRemove = (actionId: OptimisticActionId) => {
    const nextActions = [...(changes.allowedActions ?? []), actionId]
    setChanges({ ...changes, allowedActions: nextActions })
    setValue('optimisticActions', nextActions)
  }

  const onRevertAllActions = () => {
    const nextChanges = { ...changes }
    delete nextChanges.allowedActions
    setChanges(nextChanges)
    setValue('optimisticActions', currentActions)
  }

  const addedProposers = (changes.optimisticProposers ?? []).filter(
    (proposer) =>
      !currentProposers.some(
        (current) => current.toLowerCase() === proposer.toLowerCase()
      )
  )
  const removedProposers = currentProposers.filter(
    (proposer) =>
      !(changes.optimisticProposers ?? []).some(
        (next) => next.toLowerCase() === proposer.toLowerCase()
      )
  )
  const addedActions = (changes.allowedActions ?? []).filter(
    (actionId) => !currentActions.includes(actionId)
  )
  const removedActions = currentActions.filter(
    (actionId) => !(changes.allowedActions ?? []).includes(actionId)
  )

  return (
    <ChangeSection title={t`Optimistic Governance`} icon={<Wand2 size={16} />}>
      <div className="space-y-2">
        {changes.vetoDelay !== undefined && (
          <ParamChange
            icon={<Clock size={16} />}
            title={t`Veto Delay`}
            current={humanizeTimeFromSeconds(currentVetoDelay)}
            next={humanizeTimeFromSeconds(changes.vetoDelay)}
            onRevert={() => onRevertParam('vetoDelay')}
          />
        )}
        {changes.vetoPeriod !== undefined && (
          <ParamChange
            icon={<Clock size={16} />}
            title={t`Veto Period`}
            current={humanizeTimeFromSeconds(currentVetoPeriod)}
            next={humanizeTimeFromSeconds(changes.vetoPeriod)}
            onRevert={() => onRevertParam('vetoPeriod')}
          />
        )}
        {changes.vetoThreshold !== undefined && (
          <ParamChange
            icon={<FileLock2 size={16} />}
            title={t`Veto Threshold`}
            current={`${currentVetoThreshold.toFixed(2)}%`}
            next={`${changes.vetoThreshold.toFixed(2)}%`}
            onRevert={() => onRevertParam('vetoThreshold')}
          />
        )}

        {changes.optimisticProposers && (
          <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
            <div className="flex items-center justify-between p-2 pb-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldHalf size={14} />
                <Trans>Optimistic Proposers</Trans>
              </div>
              <RevertButton
                onClick={onRevertAllProposers}
                label={t`Revert All`}
              />
            </div>
            <div className="flex flex-col gap-2">
              {addedProposers.map((address) => (
                <ListChangeItem
                  key={`add-${address}`}
                  label={shortenAddress(address)}
                  type="add"
                  href={getExplorerLink(
                    address,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                  onRevert={() => onRevertProposerAdd(address)}
                />
              ))}
              {removedProposers.map((address) => (
                <ListChangeItem
                  key={`remove-${address}`}
                  label={shortenAddress(address)}
                  type="remove"
                  href={getExplorerLink(
                    address,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                  onRevert={() => onRevertProposerRemove(address)}
                />
              ))}
            </div>
          </div>
        )}

        {changes.allowedActions && (
          <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
            <div className="flex items-center justify-between p-2 pb-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wand2 size={14} />
                <Trans>Available Actions</Trans>
              </div>
              <RevertButton
                onClick={onRevertAllActions}
                label={t`Revert All`}
              />
            </div>
            <div className="flex flex-col gap-2">
              {addedActions.map((actionId) => {
                const action = getOptimisticActionById(actionId)

                return (
                  <ListChangeItem
                    key={`add-${actionId}`}
                    label={action ? t(action.label) : actionId}
                    type="add"
                    onRevert={() => onRevertActionAdd(actionId)}
                  />
                )
              })}
              {removedActions.map((actionId) => {
                const action = getOptimisticActionById(actionId)

                return (
                  <ListChangeItem
                    key={`remove-${actionId}`}
                    label={action ? t(action.label) : actionId}
                    type="remove"
                    onRevert={() => onRevertActionRemove(actionId)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ChangeSection>
  )
}

export default OptimisticGovernanceChanges
