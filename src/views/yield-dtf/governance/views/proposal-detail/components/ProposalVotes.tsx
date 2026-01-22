import { Trans } from '@lingui/macro'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import GoTo from '@/components/ui/go-to'
import { useEnsAddresses } from 'hooks/useEnsAddresses'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposalDetailAtom } from '../atom'
import { cn } from '@/lib/utils'

interface Vote {
  voter: string
  weight: string
}

const VOTE_TYPE = {
  FOR: 'FOR',
  AGAINST: 'AGAINST',
  ABSTAIN: 'ABSTAIN',
}

const getProposalVotes = atom((get) => {
  const proposal = get(proposalDetailAtom)

  const votes: { [x: string]: Vote[] } = {
    [VOTE_TYPE.FOR]: [],
    [VOTE_TYPE.AGAINST]: [],
    [VOTE_TYPE.ABSTAIN]: [],
  }

  for (const vote of proposal?.votes ?? []) {
    const { choice, ...voteDetail } = vote

    if (votes[choice]) {
      votes[choice].push(voteDetail)
    }
  }

  return votes
})

const ProposalVotes = () => {
  const chainId = useAtomValue(chainIdAtom)
  const votes = useAtomValue(getProposalVotes)
  const [current, setCurrent] = useState(VOTE_TYPE.FOR)

  const currentVotes =
    votes[current]?.sort((a, b) => +b.weight - +a.weight) || []

  const addresses = currentVotes.map((vote: Vote) => vote.voter)
  const ensRes: string[] = useEnsAddresses(addresses)

  return (
    <div className="bg-secondary rounded-lg p-2 mt-2">
      <div className="flex items-center mb-2">
        <div className="flex items-center cursor-pointer rounded-md overflow-hidden p-0.5 text-xs bg-muted">
          <div
            className={cn(
              'py-1 px-2.5 text-center rounded',
              current === VOTE_TYPE.FOR
                ? 'bg-background text-primary'
                : 'text-foreground'
            )}
            onClick={() => setCurrent(VOTE_TYPE.FOR)}
          >
            <Trans>Votes for</Trans>
          </div>
          <div
            className={cn(
              'py-1 px-2.5 text-center rounded',
              current === VOTE_TYPE.AGAINST
                ? 'bg-background text-primary'
                : 'text-foreground'
            )}
            onClick={() => setCurrent(VOTE_TYPE.AGAINST)}
          >
            <Trans>Votes against</Trans>
          </div>
          <div
            className={cn(
              'py-1 px-2.5 text-center rounded',
              current === VOTE_TYPE.ABSTAIN
                ? 'bg-background text-primary'
                : 'text-foreground'
            )}
            onClick={() => setCurrent(VOTE_TYPE.ABSTAIN)}
          >
            <Trans>Abstain</Trans>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-md overflow-hidden shadow-sm border border-secondary py-2">
        <div className="max-h-[420px] overflow-auto">
          {currentVotes.map((vote, index) => (
            <div
              className="flex items-center gap-2 py-2 px-4"
              key={vote.voter}
            >
              <BlockiesAvatar address={vote.voter} />
              <span>
                {!!ensRes[index] ? ensRes[index] : shortenAddress(vote.voter)}
              </span>
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
                  current === 'FOR'
                    ? 'text-primary'
                    : current === 'AGAINST'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                )}
              >
                {formatCurrency(+vote.weight, 0, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </span>
            </div>
          ))}
        </div>

        {!currentVotes.length && (
          <div className="text-center">
            <span className="text-legend">
              <Trans>No votes</Trans>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProposalVotes
