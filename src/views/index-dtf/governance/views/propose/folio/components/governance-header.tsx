import { useAtomValue } from 'jotai'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Skeleton } from '@/components/ui/skeleton'

const GovernanceHeader = () => {
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">
        Reserve Index Governance Proposal
      </h1>
      <p className="text-sm text-neutral-400">
        Create a governance proposal to update the parameters of this Reserve
        Index. Changes will be subject to approval by governance token holders.
      </p>
    </div>
  )
}

export default GovernanceHeader
