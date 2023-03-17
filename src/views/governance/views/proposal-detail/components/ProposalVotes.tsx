import { Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { atom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Box, Progress, Text } from 'theme-ui'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposalDetailAtom } from '../atom'

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
  const votes = useAtomValue(getProposalVotes)
  const proposal = useAtomValue(proposalDetailAtom)
  const [current, setCurrent] = useState(VOTE_TYPE.FOR)

  const forVotesWeight = useMemo(() => {
    if (proposal?.abstainWeightedVotes && proposal.forWeightedVotes) {
      const total = +proposal.abstainWeightedVotes + +proposal.forWeightedVotes

      return (+proposal.forWeightedVotes * 100) / total
    }

    return 0
  }, [proposal])

  return (
    <Box variant="layout.borderBox" mt={4}>
      <Box variant="layout.verticalAlign" mb={4}>
        <Box
          variant="layout.verticalAlign"
          sx={{
            cursor: 'pointer',
            borderRadius: 50,
            overflow: 'hidden',
            padding: 1,
            fontSize: 1,
            border: '1px solid',
            borderColor: 'inputBorder',
          }}
        >
          <Box
            py={1}
            px={'10px'}
            sx={{
              textAlign: 'center',
              borderRadius: 30,
              backgroundColor:
                current === VOTE_TYPE.FOR ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setCurrent(VOTE_TYPE.FOR)}
          >
            <Trans>Votes for</Trans>
          </Box>
          <Box
            py={1}
            px={'10px'}
            sx={{
              textAlign: 'center',
              borderRadius: 30,
              backgroundColor:
                current === VOTE_TYPE.AGAINST ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setCurrent(VOTE_TYPE.AGAINST)}
          >
            <Trans>Votes against</Trans>
          </Box>
        </Box>
        {(!!Number(proposal?.forWeightedVotes) ||
          !!Number(proposal?.againstWeightedVotes)) && (
          <Progress
            ml="auto"
            max={1}
            sx={{
              width: '30%',
              color: 'success',
              backgroundColor: 'danger',
              height: 10,
            }}
            value={forVotesWeight}
          />
        )}
      </Box>

      <Box variant="layout.verticalAlign" mb={3}>
        <Box variant="layout.square" mr={2} />
        <Text variant="legend">Voter</Text>
        <Text ml="auto" variant="legend">
          Votes
        </Text>
      </Box>
      <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
        {(votes[current] || []).map((vote, index) => (
          <Box
            variant="layout.verticalAlign"
            key={vote.voter}
            mt={!!index ? 2 : 0}
          >
            <Box
              variant="layout.square"
              sx={{
                backgroundColor:
                  current === VOTE_TYPE.FOR ? 'success' : 'danger',
              }}
              mr={2}
            />
            <Text>{shortenAddress(vote.voter)}</Text>
            <GoTo
              ml={1}
              href={getExplorerLink(vote.voter, ExplorerDataType.ADDRESS)}
            />
            <Text ml="auto">{formatCurrency(+vote.weight)}</Text>
          </Box>
        ))}
      </Box>

      {!votes[current]?.length && (
        <Box sx={{ textAlign: 'center' }}>
          <Text variant="legend">
            <Trans>No votes</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default ProposalVotes
