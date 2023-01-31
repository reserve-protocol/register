import { Trans } from '@lingui/macro'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import dayjs from 'dayjs'

const query = gql`
  query getProposals($id: String!) {
    proposals(governance: $id) {
      id
      description
      creationTime
      state
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
  const { data, loading, error } = useProposals()

  return (
    <Box>
      <Text variant="strong">
        <Trans>Recent proposals</Trans>
      </Text>
      <Box p={4}>
        {data.map((proposal: StringMap) => (
          <Box key={proposal.id} variant="layout.verticalAlign">
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
  )
}

export default ProposalList
