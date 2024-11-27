import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { Badge, Box, Link, Text } from 'theme-ui'
import { StringMap } from 'types'
import { getProposalTitle, getTokenRoute } from 'utils'
import { PROPOSAL_STATES, ROUTES, formatConstant } from 'utils/constants'
import useProposalsData, { ProposalRecord } from './useProposalsData'
import Filters from './Filters'
import { ProposalVotingState } from '@/views/rtoken/governance/components/ProposalList'

const BADGE_VARIANT: StringMap = {
  [PROPOSAL_STATES.DEFEATED]: 'danger',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'danger',
  [PROPOSAL_STATES.ACTIVE]: 'info',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'danger',
}

const ExploreGovernance = () => {
  const data = useProposalsData()
  // TODO: Proper typing to support the state
  const columnHelper = createColumnHelper<any>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('rTokenSymbol', {
        header: t`Token`,
        cell: (data) => {
          const logo = useRTokenLogo(
            data.row.original.rTokenAddress,
            data.row.original.chain
          )

          return <TokenItem symbol={data.getValue()} logo={logo} />
        },
      }),
      columnHelper.accessor('description', {
        header: t`Description`,
        cell: (data) => (
          <Box>
            <Link
              href={getTokenRoute(
                data.row.original.rTokenAddress,
                data.row.original.chain,
                `${ROUTES.GOVERNANCE_PROPOSAL}/${data.row.original.id}`
              )}
              target="_blank"
              sx={{ textDecoration: 'underline' }}
            >
              <Text sx={{ textTransform: 'capitalize' }}>
                {getProposalTitle(data.getValue())}
              </Text>
            </Link>
            <ProposalVotingState data={data.row.original.state} />
          </Box>
        ),
      }),
      columnHelper.accessor('creationTime', {
        header: t`Created At`,
        cell: (data) => (
          <Text>{dayjs.unix(+data.getValue()).format('YYYY-M-D')}</Text>
        ),
      }),
      columnHelper.accessor('status', {
        header: t`Status`,
        cell: (data) => (
          <Badge
            ml="auto"
            sx={{ flexShrink: 0 }}
            variant={BADGE_VARIANT[data.getValue()] || 'muted'}
          >
            {formatConstant(data.getValue())}
          </Badge>
        ),
      }),
    ],
    []
  )

  return (
    <Box mt={[3, 5]} mx={[2, 3]}>
      <Box
        variant="layout.verticalAlign"
        sx={{ flexWrap: 'wrap', gap: '2' }}
        mb={5}
      >
        <GovernanceIcon fontSize={32} />
        <Text as="h2" mr="auto" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Proposals</Trans>
        </Text>
        <Filters />
      </Box>
      <Table
        sorting
        sortBy={[{ id: 'creationTime', desc: true }]}
        data={data}
        pagination={{ pageSize: 10 }}
        columnVisibility={['', '', ['none', 'table-cell'], '']}
        columns={columns}
        sx={{ borderRadius: '0 0 20px 20px' }}
        compact
      />
    </Box>
  )
}

export default ExploreGovernance
