import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { blockAtom, selectedRTokenAtom } from 'state/atoms'
import { Badge, Box, Text, Card } from 'theme-ui'
import { StringMap } from 'types'
import { getProposalTitle } from 'utils'
import { PROPOSAL_STATES, formatConstant } from 'utils/constants'
import { getProposalStatus } from '../views/proposal-detail/atom'

const query = gql`
  query getProposals($id: String!) {
    proposals(
      where: { governance: $id }
      orderBy: creationTime
      orderDirection: desc
    ) {
      id
      description
      creationTime
      state
      governance
      forWeightedVotes
      againstWeightedVotes
      quorumVotes
      startBlock
      endBlock
    }
  }
`

const BADGE_VARIANT: StringMap = {
  [PROPOSAL_STATES.DEFEATED]: 'danger',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'danger',
  [PROPOSAL_STATES.ACTIVE]: 'info',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'danger',
}

const useProposals = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const response = useQuery(rToken ? query : null, {
    id: (rToken ?? '').toLowerCase(),
  })

  return useMemo(() => {
    const { data, error } = response

    return {
      data: data?.proposals ?? [],
      error: !!error,
      loading: !data?.proposals && !error,
    }
  }, [JSON.stringify(response)])
}

const ProposalList = () => {
  const navigate = useNavigate()
  const { data } = useProposals()
  const block = useAtomValue(blockAtom)
  const blockNumber = useMemo(() => block, [!!block])

  return (
    <Box
      variant="layout.card"
      p={2}
      sx={{
        backgroundColor: 'contentBackground',
        border: '3px solid',
        borderColor: 'borderFocused',
      }}
    >
      <Box px={3} py={3} variant="layout.verticalAlign">
        <Text variant="sectionTitle">
          <Trans>Recent proposals</Trans>
        </Text>
        <SmallButton ml="auto" onClick={() => navigate('proposal')}>
          <Trans>Create proposal</Trans>
        </SmallButton>
      </Box>
      <Box
        mt={2}
        sx={{
          maxHeight: 540,
          overflow: 'scroll',
          borderRadius: '6px',
          '::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {!data.length && (
          <Box py={4} mt={4} sx={{ textAlign: 'center' }}>
            <EmptyBoxIcon />
            <Text
              mt={4}
              variant="legend"
              sx={{
                display: 'block',
              }}
            >
              <Trans>No proposals created...</Trans>
            </Text>
          </Box>
        )}
        {data.map((proposal: StringMap) => {
          const status = getProposalStatus(proposal, blockNumber || 0)

          return (
            <Box
              p={3}
              key={proposal.id}
              sx={{
                backgroundColor: 'backgroundNested',
                borderBottom: '1px solid',
                borderColor: 'border',
                cursor: 'pointer',
                ':hover': {
                  borderColor: 'backgroundNested',
                  backgroundColor: 'border',
                },
              }}
              variant="layout.verticalAlign"
              onClick={() => navigate(`proposal/${proposal.id}`)}
            >
              <Box mr={3}>
                <Text variant="strong">
                  {getProposalTitle(proposal.description)}
                </Text>
                <Text variant="legend" sx={{ fontSize: 1 }}>
                  <Trans>Created at:</Trans>{' '}
                  {dayjs.unix(+proposal.creationTime).format('YYYY-M-D')}
                </Text>
              </Box>
              <Badge
                ml="auto"
                sx={{ flexShrink: 0 }}
                variant={BADGE_VARIANT[status] || 'muted'}
              >
                {formatConstant(status)}
              </Badge>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default ProposalList
