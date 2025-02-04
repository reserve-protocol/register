import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { lazy, Suspense } from 'react'
import { proposalDetailAtom } from '../atom'
import { useAtomValue } from 'jotai'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import BasketProposalPreview from '../../propose/types/basket/components/proposal-basket-preview'
import { Address } from 'viem'

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
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  if (!proposal || !dtf) return <Skeleton className="h-80" />

  if (
    proposal.governor.toLowerCase() !== dtf.tradingGovernance?.id.toLowerCase()
  ) {
    return <div className="text-legend text-center py-8">Coming soon...</div>
  }

  return (
    <BasketProposalPreview
      calldatas={proposal.calldatas}
      basket={basket}
      shares={shares}
      prices={prices}
      address={dtf.id.toLowerCase() as Address}
    />
  )
}

const ProposalDetailContent = () => {
  return (
    <Tabs className="bg-card rounded-3xl h-fit" defaultValue={TABS.DESCRIPTION}>
      <TabsList className="h-9 mx-4 mt-4">
        <TabsTrigger value={TABS.DESCRIPTION} className="w-max h-7">
          Description
        </TabsTrigger>
        <TabsTrigger value={TABS.CHANGES} className="w-max h-7">
          Proposed changes
        </TabsTrigger>
      </TabsList>
      <TabsContent value={TABS.DESCRIPTION}>
        <ProposalDescription />
      </TabsContent>
      <TabsContent value={TABS.CHANGES}>
        <ProposalChanges />
      </TabsContent>
    </Tabs>
  )
}

export default ProposalDetailContent
