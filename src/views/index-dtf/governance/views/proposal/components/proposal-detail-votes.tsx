import GoTo from '@/components/ui/go-to'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import EnsName from '@/components/utils/ens-name'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/macro'
import type { Amount } from '@reserve-protocol/react-sdk'
import { atom, useAtomValue } from 'jotai'
import { proposalDetailAtom } from '../atom'

const TABS = {
  FOR: 'FOR',
  AGAINST: 'AGAINST',
  ABSTAIN: 'ABSTAIN',
}

interface Vote {
  voter: string
  weight: Amount
  choice: string
}

const proposalVotesAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)
  const votes: { [x: string]: Vote[] } = {
    [TABS.FOR]: [],
    [TABS.AGAINST]: [],
    [TABS.ABSTAIN]: [],
  }

  for (const vote of proposal?.votes ?? []) {
    if (votes[vote.choice]) {
      votes[vote.choice].push(vote)
    }
  }

  return votes
})

const VoteList = ({ votes }: { votes: Vote[] }) => {
  const chainId = useAtomValue(chainIdAtom)

  if (!votes.length) {
    return (
      <div className="text-center">
        <span className="text-legend">
          <Trans>No votes</Trans>
        </span>
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-[420px]">
      <div className="flex flex-col gap-2">
        {votes.map((vote) => (
          <div className="flex items-center gap-2 mb-1" key={vote.voter}>
            <BlockiesAvatar address={vote.voter} />
            <EnsName address={vote.voter} />
            <GoTo
              href={getExplorerLink(
                vote.voter,
                chainId,
                ExplorerDataType.ADDRESS
              )}
            />
            <span
              className={cn(
                'ml-auto',
                vote.choice === 'FOR' && 'text-primary',
                vote.choice === 'AGAINST' && 'text-destructive',
                vote.choice === 'ABSTAIN' && 'text-legend'
              )}
            >
              {formatCurrency(Number(vote.weight.formatted), 0, {
                notation: 'compact',
                compactDisplay: 'short',
              })}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

const ProposalDetailVotes = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const votes = useAtomValue(proposalVotesAtom)

  if (proposal?.isOptimistic) {
    return (
      <div className="bg-background rounded-3xl p-4">
        <h2 className="text-xl ml-3 font-semibold mb-4">
          <Trans>Challenged votes</Trans>
        </h2>
        <div className="bg-card rounded-3xl p-4 border">
          <VoteList votes={votes[TABS.AGAINST]} />
        </div>
      </div>
    )
  }

  return (
    <Tabs className="bg-background rounded-3xl p-2" defaultValue={TABS.FOR}>
      <TabsList>
        <TabsTrigger value={TABS.FOR}>Votes for</TabsTrigger>
        <TabsTrigger value={TABS.AGAINST}>Votes against</TabsTrigger>
        <TabsTrigger value={TABS.ABSTAIN}>Abstain</TabsTrigger>
      </TabsList>
      <div className="bg-card rounded-3xl p-4 border mt-2">
        {Object.entries(votes).map(([key, value]) => (
          <TabsContent value={key} key={key}>
            <VoteList votes={value} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

export default ProposalDetailVotes
