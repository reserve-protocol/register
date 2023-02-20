import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import { ROUTES } from 'utils/constants'

const query = gql`
  query getProposals($id: String!) {
    proposals(where: { governance: $id }) {
      id
      description
      creationTime
      state
      governance
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
  const { data, loading, error } = useProposals()

  return (
    <Box>
      <Box
        variant="layout.borderBox"
        sx={{ backgroundColor: 'contentBackground' }}
      >
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

        <Box px={4} mt={3}>
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
                No proposals created...
              </Text>
            </Box>
          )}
          {data.map((proposal: StringMap) => (
            <Box mt={4} key={proposal.id} variant="layout.verticalAlign">
              <Box>
                <Text variant="strong">{proposal.description}</Text>
                <Text variant="legend" sx={{ fontSize: 1 }}>
                  <Trans>Created at:</Trans>{' '}
                  {dayjs.unix(+proposal.creationTime).format('YYYY-M-d')}
                </Text>
              </Box>
              <Badge ml="auto">{proposal.state}</Badge>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalList
