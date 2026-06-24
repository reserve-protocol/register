import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import { governanceProposalsAtom } from '../atoms'
import ProposalListItem from './proposal-list-item'

const CreateProposalButton = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'governance')
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)

  const button = (
    <Button
      className="text-primary hover:text-primary gap-1"
      variant="ghost"
      size="sm"
      disabled={isDeprecated}
    >
      <PlusSquare size={16} />
      <Trans>Create proposal</Trans>
    </Button>
  )

  if (isDeprecated) return button

  return (
    <Link
      to={ROUTES.GOVERNANCE_PROPOSE}
      onClick={() => trackClick('create_proposal')}
    >
      {button}
    </Link>
  )
}

const Header = () => (
  <div className="py-4 px-5 flex items-center gap-2">
    <h1 className="font-semibold text-xl text-primary dark:text-muted-foreground mr-auto">
      <Trans>Recent proposals</Trans>
    </h1>
    <CreateProposalButton />
  </div>
)

// TODO: Replace for a more accurate proposal list skeleton
const ProposalsSkeleton = () => (
  <Skeleton className="h-[520px] m-1 rounded-3xl" />
)

const ProposalsPlaceholder = () => (
  <div className="flex items-center justify-center h-96">
    <p className="text-muted-foreground">
      <Trans>No proposals found</Trans>
    </p>
  </div>
)

const ProposalShowMoreButton = ({
  showAll,
  onClick,
}: {
  showAll: boolean
  onClick: () => void
}) => (
  <div className="flex justify-center p-4 border-t">
    <Button variant="outline-primary" onClick={onClick} className="gap-2">
      {showAll ? <Trans>Show less</Trans> : <Trans>Show all</Trans>}
    </Button>
  </div>
)

const ProposalList = () => {
  const [showAll, setShowAll] = useState(false)
  const allProposals = useAtomValue(governanceProposalsAtom)

  if (!allProposals) return <ProposalsSkeleton />

  const sortedProposals = [...allProposals].sort(
    (a, b) => b.creationTime - a.creationTime
  )

  const displayedProposals = showAll
    ? sortedProposals
    : sortedProposals.slice(0, 10)

  const hasMoreProposals = sortedProposals.length > 10

  return (
    <div className="m-1 mt-0">
      <ScrollArea className="overflow-y-auto">
        <div className="space-y-1">
          {sortedProposals.length === 0 && <ProposalsPlaceholder />}
          {displayedProposals.map((proposal) => (
            <ProposalListItem key={proposal.id} proposal={proposal} />
          ))}
        </div>
      </ScrollArea>
      {hasMoreProposals && (
        <ProposalShowMoreButton
          showAll={showAll}
          onClick={() => setShowAll(!showAll)}
        />
      )}
    </div>
  )
}

const GovernanceProposalList = () => (
  <div className="rounded-4xl bg-secondary h-fit">
    <Header />
    <ProposalList />
  </div>
)

export default GovernanceProposalList
