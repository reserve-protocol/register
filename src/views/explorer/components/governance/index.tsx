import { cn } from '@/lib/utils'
import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import { Table } from '@/components/ui/legacy-table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { StringMap } from 'types'
import { getProposalTitle, getTokenRoute } from 'utils'
import { PROPOSAL_STATES, ROUTES, formatConstant } from 'utils/constants'
import useProposalsData, { ProposalRecord } from './useProposalsData'
import Filters from './Filters'
import { ProposalVotingState } from '@/views/yield-dtf/governance/components/ProposalList'

const BADGE_VARIANT: StringMap = {
  [PROPOSAL_STATES.DEFEATED]: 'danger',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'danger',
  [PROPOSAL_STATES.ACTIVE]: 'info',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'danger',
}

const badgeClasses: StringMap = {
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  muted: 'bg-muted text-muted-foreground',
}

const ExploreGovernance = () => {
  const data = useProposalsData()
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
          <div>
            <a
              href={getTokenRoute(
                data.row.original.rTokenAddress,
                data.row.original.chain,
                `${ROUTES.GOVERNANCE_PROPOSAL}/${data.row.original.id}`
              )}
              target="_blank"
              className="underline"
            >
              <span className="capitalize">
                {getProposalTitle(data.getValue())}
              </span>
            </a>
            <ProposalVotingState data={data.row.original.state} />
          </div>
        ),
      }),
      columnHelper.accessor('creationTime', {
        header: t`Created At`,
        cell: (data) => (
          <span>{dayjs.unix(+data.getValue()).format('YYYY-M-D')}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: t`Status`,
        cell: (data) => (
          <span
            className={cn(
              'ml-auto shrink-0 font-bold rounded-full px-3.5 py-1.5',
              badgeClasses[BADGE_VARIANT[data.getValue()] || 'muted']
            )}
          >
            {formatConstant(data.getValue())}
          </span>
        ),
      }),
    ],
    []
  )

  return (
    <div className="mt-4 md:mt-8 mx-2 md:mx-4">
      <div className="flex items-center pl-5 flex-wrap gap-2 mb-8">
        <GovernanceIcon fontSize={32} />
        <h2 className="mr-auto text-xl font-medium">
          <Trans>Proposals</Trans>
        </h2>
        <Filters />
      </div>
      <Table
        sorting
        sortBy={[{ id: 'creationTime', desc: true }]}
        data={data}
        pagination={{ pageSize: 10 }}
        className='border-2 border-secondary pt-0'
        columnVisibility={['', '', ['none', 'table-cell'], '']}
        columns={columns}
      />
    </div>
  )
}

export default ExploreGovernance
