import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import { getProposalTitle } from 'utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { getProposalStatus } from '../views/proposal-detail/atom'
import { useAtomValue } from 'jotai'
import { blockAtom } from 'state/atoms'

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
}

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
  const block = useAtomValue(blockAtom)
  const blockNumber = useMemo(() => block, [!!block])

  return (
    <Box
      variant="layout.card"
      p={4}
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

      <Box
        mt={3}
        sx={{
          maxHeight: 540,
          overflow: 'scroll',
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
