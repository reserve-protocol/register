import { Trans } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'

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
  const { data, loading, error } = useProposals()

  return (
    <Box>
      <Box variant="layout.borderBox">
        <Text variant="strong">
          <Trans>Recent proposals</Trans>
        </Text>
        <Box px={4} mt={2}>
          {!data.length && (
            <Box py={4} mt={4} sx={{ textAlign: 'center' }}>
              <EmptyBoxIcon />
              <Text
                mt={3}
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
            <Box mt={3} key={proposal.id} variant="layout.verticalAlign">
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
