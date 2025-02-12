import CopyValue from '@/components/old/button/CopyValue'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRight, ShieldHalf } from 'lucide-react'
import { Link } from 'react-router-dom'

const Placeholder = () => (
  <div className="flex items-center justify-between bg-background rounded-3xl p-4">
    <div className="flex items-center gap-3">
      {/* Avatar/Icon */}
      <Skeleton className="h-8 w-8 rounded-full" />

      {/* Text content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" /> {/* Guardian text */}
        <Skeleton className="h-4 w-32" /> {/* Address */}
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6" /> {/* Copy icon */}
      <Skeleton className="h-6 w-6" /> {/* External link icon */}
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

const GovernanceGuardians = () => {
  const guardians = useAtomValue(guardiansAtom)
  const chainId = useAtomValue(chainIdAtom)
  if (!guardians) return <Placeholder />

  return (
    <div className="flex flex-col bg-background rounded-3xl">
      {guardians.map((guardian, index) => (
        <div className={cn('flex items-center p-6', !!index && 'border-t')}>
          <div className="border rounded-full border-foreground p-1">
            <ShieldHalf size={14} />
          </div>
          <div className="ml-3 mr-auto">
            <span className="text-legend text-sm block">Guardians</span>
            <span className="font-bold">{shortenAddress(guardian)}</span>
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
    </div>
  )
}

export default GovernanceGuardians
