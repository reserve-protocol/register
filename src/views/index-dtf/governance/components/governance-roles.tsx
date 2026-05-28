import CopyValue from '@/components/ui/copy-value'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import EnsName from '@/components/utils/ens-name'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRight, ShieldHalf } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Trans } from '@lingui/react/macro'

const Placeholder = () => (
  <div className="flex items-center justify-between bg-background rounded-3xl p-4">
    <div className="flex items-center gap-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-6 w-6" />
    </div>
  </div>
)

const guardiansAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const added = new Set()

  // TODO: Currently we have 2 govs but we handle a single guardian list
  return [
    ...(dtf.ownerGovernance?.timelock.guardians ?? []),
    ...(dtf.tradingGovernance?.timelock.guardians ?? []),
  ].filter((guardian) => {
    if (added.has(guardian)) return false

    added.add(guardian)

    return (
      guardian !== dtf.ownerGovernance?.id &&
      guardian !== dtf.tradingGovernance?.id
    )
  })
})

const optimisticProposersAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  return dtf.ownerGovernance?.optimistic?.proposers ?? []
})

const GovernanceRoles = () => {
  const guardians = useAtomValue(guardiansAtom)
  const optimisticProposers = useAtomValue(optimisticProposersAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex flex-col bg-background rounded-3xl">
      <div className="flex items-center px-4 pt-4 gap-4">
        <div className="border rounded-full border-foreground p-1">
          <ShieldHalf size={14} />
        </div>
        <h4 className="text-xl font-semibold text-primary">
          <Trans>Roles</Trans>
        </h4>
      </div>
      {(!guardians || !optimisticProposers) && <Placeholder />}
      {!!guardians &&
        guardians.map((guardian, index) => (
          <div
            className={cn('flex items-center p-6', !!index && 'border-t')}
            key={`guardian-${guardian}`}
          >
            <div className="mr-auto">
              <span className="text-legend text-sm block">
                <Trans>Guardian</Trans> {index + 1}
              </span>
              <span className="font-bold">
                <EnsName address={guardian} />
              </span>
            </div>
            <div className="p-1 bg-muted rounded-full mr-2">
              <CopyValue value={guardian} />
            </div>
            <Link
              to={getExplorerLink(guardian, chainId, ExplorerDataType.ADDRESS)}
              target="_blank"
              className="p-1 bg-muted rounded-full"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
      {!!optimisticProposers &&
        optimisticProposers.map((proposer, index) => (
          <div
            className={cn(
              'flex items-center p-6',
              (!!guardians?.length || !!index) && 'border-t'
            )}
            key={`optimistic-proposer-${proposer}`}
          >
            <div className="mr-auto">
              <span className="text-legend text-sm block">
                <Trans>Optimistic proposer</Trans> {index + 1}
              </span>
              <span className="font-bold">
                <EnsName address={proposer} />
              </span>
            </div>
            <div className="p-1 bg-muted rounded-full mr-2">
              <CopyValue value={proposer} />
            </div>
            <Link
              to={getExplorerLink(proposer, chainId, ExplorerDataType.ADDRESS)}
              target="_blank"
              className="p-1 bg-muted rounded-full"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
    </div>
  )
}

export default GovernanceRoles
