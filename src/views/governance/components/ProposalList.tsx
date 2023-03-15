import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import { getProposalTitle } from 'utils'
import { ROUTES } from 'utils/constants'
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

// TODO: Proposal data casting?
const useProposals = () => {
  const rToken = useRToken()
  const response = useQuery(rToken?.address && !rToken.isRSV ? query : null, {
    id: rToken?.address.toLowerCase(),
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
  const rToken = useRToken()
  const navigate = useNavigate()
  const { data } = useProposals()
  const block = useBlockNumber()
  const blockNumber = useMemo(() => block, [!!block])

  return (
    <Box>
      <Box variant="layout.borderBox">
        <Box variant="layout.verticalAlign">
          <Text variant="title">
            <Trans>Recent proposals</Trans>
          </Text>
          <SmallButton
            ml="auto"
            onClick={() =>
              navigate(`${ROUTES.GOVERNANCE_PROPOSAL}?token=${rToken?.address}`)
            }
          >
            <Trans>Create proposal</Trans>
          </SmallButton>
        </Box>

        <Box px={4} mt={3} sx={{ maxHeight: 420, overflow: 'auto' }}>
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
          {data.map((proposal: StringMap) => (
            <Box
              mt={4}
              key={proposal.id}
              sx={{ cursor: 'pointer' }}
              variant="layout.verticalAlign"
              onClick={() =>
                navigate(
                  `${ROUTES.GOVERNANCE_PROPOSAL}/${proposal.id}?token=${rToken?.address}`
                )
              }
            >
              <Box>
                <Text variant="strong">
                  {getProposalTitle(proposal.description)}
                </Text>
                <Text variant="legend" sx={{ fontSize: 1 }}>
                  <Trans>Created at:</Trans>{' '}
                  {dayjs.unix(+proposal.creationTime).format('YYYY-M-D')}
                </Text>
              </Box>
              <Badge ml="auto">
                {getProposalStatus(proposal, blockNumber || 0)}
              </Badge>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalList
