import GoTo from '@/components/old/button/GoTo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import { proposalDetailAtom } from '../atom'

const TABS = {
  FOR: 'for',
  AGAINST: 'against',
  ABSTAIN: 'abstain',
}

interface Vote {
  voter: string
  weight: string
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
      {votes.map((vote) => (
        <div className="flex items-center gap-2" key={vote.voter}>
          <BlockiesAvatar address={vote.voter} />
          {shortenAddress(vote.voter)}
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
            {formatCurrency(+vote.weight, 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
      ))}
    </ScrollArea>
  )
}

const ProposalDetailVotes = () => {
  const votes = useAtomValue(proposalVotesAtom)

  return (
    <Tabs className="bg-background rounded-3xl p-2" defaultValue={TABS.FOR}>
      <TabsList>
        <TabsTrigger value={TABS.FOR}>Votes for</TabsTrigger>
        <TabsTrigger value={TABS.AGAINST}>Votes against</TabsTrigger>
        <TabsTrigger value={TABS.ABSTAIN}>Abstain</TabsTrigger>
      </TabsList>
      <div className="bg-card rounded-3xl p-4 border mt-2">
        {Object.entries(votes).map(([key, value]) => (
          <TabsContent value={key}>
            <VoteList votes={value} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

export default ProposalDetailVotes
