import { Skeleton } from '@/components/ui/skeleton'
import { useAtomValue } from 'jotai'
import { lazy, Suspense } from 'react'
import GovernanceProposalPreview from '../../../components/governance-proposal-preview'
import { proposalDetailAtom } from '../atom'

const TABS = {
  DESCRIPTION: 'description',
  CHANGES: 'changes',
}

const DescriptionMarkdown = lazy(() => import('./proposal-md-description'))

const ProposalDescription = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  if (!proposal?.description) return <Skeleton className="h-80" />

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
    <div className="px-6 pt-4 pb-2">
      <h1 className="text-primary text-xl font-bold mb-2">Description</h1>
      <Suspense fallback={<Skeleton className="h-80" />}>
        <DescriptionMarkdown description={description} />
      </Suspense>
    </div>
  )
}

// TODO: Currently only supports basket changes!!!
// TODO: WRAP INTO ERROR CONTEXT THIS COULD CRASH!!!
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
