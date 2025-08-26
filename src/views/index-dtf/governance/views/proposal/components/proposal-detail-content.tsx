import { Skeleton } from '@/components/ui/skeleton'
import { useAtomValue } from 'jotai'
import { lazy, Suspense } from 'react'
import GovernanceProposalPreview from '../../../components/governance-proposal-preview'
import { proposalDetailAtom } from '../atom'

const DescriptionMarkdown = lazy(() => import('./proposal-md-description'))

const ProposalDescriptionSkeleton = () => (
  <div className="px-6 pt-4 pb-2">
    <h1 className="text-primary text-xl font-bold mb-2">Description</h1>
    <Skeleton className="h-6" />
    <Skeleton className="h-6 mt-1" />
    <Skeleton className="h-6 mt-1" />
  </div>
)

const ProposalDescription = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  if (!proposal?.description) return <ProposalDescriptionSkeleton />

  let description = ''
  if (proposal?.description) {
    const [_, rfc, ...content] = proposal.description.split(/\r?\n/)
    if (!rfc?.includes('forum')) {
      content.unshift(rfc)
    }
    description = content.join('\n')
  }

  if (description.length < 9) {
    return (
      <div className="text-legend text-center py-8">
        No description provided
      </div>
    )
  }

  return (
    <Suspense fallback={<ProposalDescriptionSkeleton />}>
      <div className="px-6 pt-4 pb-2">
        <h1 className="text-primary text-xl font-bold mb-2">Description</h1>
        <DescriptionMarkdown description={description} />
      </div>
    </Suspense>
  )
}

const ProposalChanges = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  return (
    <div className="-mt-4">
      <GovernanceProposalPreview
        targets={proposal?.targets}
        calldatas={proposal?.calldatas}
        timestamp={proposal?.creationTime}
      />
    </div>
  )
}

const ProposalDetailContent = () => (
  <div className="bg-card rounded-3xl h-fit">
    <ProposalDescription />
    <ProposalChanges />
  </div>
)

export default ProposalDetailContent
