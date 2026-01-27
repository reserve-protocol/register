import { useAtomValue } from 'jotai'
import { lazy, Suspense, useState } from 'react'
import ProposalDetail from '@/views/yield-dtf/governance/components/ProposalDetailPreview'
import { proposalDetailAtom } from '../atom'
import Skeleton from 'react-loading-skeleton'
import { cn } from '@/lib/utils'

const DescriptionMarkdown = lazy(() => import('./ProposalMdDescription'))

const TABS = {
  DESCRIPTION: 'description',
  CHANGES: 'changes',
}

const ProposalDetailContent = () => {
  const [tab, setTab] = useState(TABS.DESCRIPTION)
  const proposal = useAtomValue(proposalDetailAtom)
  let description = ''

  if (proposal?.description) {
    const [_, rfc, ...content] = proposal.description.split(/\r?\n/)
    if (!rfc?.includes('forum')) {
      content.unshift(rfc)
    }
    description = content.join('\n')
  }

  return (
    <div className="bg-secondary rounded-lg p-2">
      <div className="flex items-center p-0 sm:p-2 mb-2">
        <div className="flex items-center cursor-pointer rounded-md overflow-hidden p-0.5 text-xs bg-muted">
          <div
            className={cn(
              'py-1 px-2.5 text-center rounded',
              tab === TABS.DESCRIPTION
                ? 'bg-card text-foreground'
                : 'text-foreground'
            )}
            onClick={() => setTab(TABS.DESCRIPTION)}
          >
            Description
          </div>
          <div
            className={cn(
              'py-1 px-2.5 text-center rounded',
              tab === TABS.CHANGES
                ? 'bg-card text-foreground'
                : 'text-foreground'
            )}
            onClick={() => setTab(TABS.CHANGES)}
          >
            Proposed changes
          </div>
        </div>
      </div>

      {tab === TABS.DESCRIPTION ? (
        <div className="px-4 pb-2">
          <Suspense fallback={<Skeleton />}>
            <DescriptionMarkdown description={description} />
          </Suspense>
        </div>
      ) : (
        !!proposal && (
          <ProposalDetail
            addresses={proposal.targets}
            calldatas={proposal.calldatas}
            snapshotBlock={proposal.creationBlock}
            className="bg-card rounded-md border border-border"
            borderColor="border"
          />
        )
      )}
    </div>
  )
}

export default ProposalDetailContent
