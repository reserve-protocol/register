import { Trans } from '@lingui/macro'
import Blockies from 'components/blockies'
import GoTo from 'components/button/GoTo'
import { useEnsAddresses } from 'hooks/useEnsAddresses'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
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
  const chainId = useAtomValue(chainIdAtom)
  const votes = useAtomValue(getProposalVotes)
  const [current, setCurrent] = useState(VOTE_TYPE.FOR)

  const addresses = (votes[current] || []).map((vote: Vote) => vote.voter)
  const ensRes: string[] = useEnsAddresses(addresses)

  return (
    <Box sx={{ bg: 'background', borderRadius: '8px', p: 2, mt: 2 }}>
      <Box variant="layout.verticalAlign" mb={2}>
        <Box
          variant="layout.verticalAlign"
          sx={{
            cursor: 'pointer',
            borderRadius: '6px',
            overflow: 'hidden',
            padding: '2px',
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
              borderRadius: '4px',
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
              borderRadius: '4px',
              backgroundColor:
                current === VOTE_TYPE.AGAINST ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setCurrent(VOTE_TYPE.AGAINST)}
          >
            <Trans>Votes against</Trans>
          </Box>
          <Box
            py={1}
            px={'10px'}
            sx={{
              textAlign: 'center',
              borderRadius: '4px',
              backgroundColor:
                current === VOTE_TYPE.ABSTAIN ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setCurrent(VOTE_TYPE.ABSTAIN)}
          >
            <Trans>Abstain</Trans>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          bg: 'focusedBackground',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
          py: 2,
        }}
      >
        <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
          {(votes[current]?.sort((a, b) => +b.weight - +a.weight) || []).map(
            (vote, index) => (
              <Box
                variant="layout.verticalAlign"
                sx={{ gap: 2 }}
                key={vote.voter}
                py={2}
                px={3}
              >
                <Blockies address={vote.voter} />
                <Text>
                  {!!ensRes[index] ? ensRes[index] : shortenAddress(vote.voter)}
                </Text>
                <GoTo
                  href={getExplorerLink(
                    vote.voter,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                />
                <Text
                  ml="auto"
                  color={
                    current === 'FOR'
                      ? 'primary'
                      : current === 'AGAINST'
                      ? 'red'
                      : 'secondaryText'
                  }
                >
                  {formatCurrency(+vote.weight, 0, {
                    notation: 'compact',
                    compactDisplay: 'short',
                  })}
                </Text>
              </Box>
            )
          )}
        </Box>

        {!votes[current]?.length && (
          <Box sx={{ textAlign: 'center' }}>
            <Text variant="legend">
              <Trans>No votes</Trans>
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ProposalVotes
