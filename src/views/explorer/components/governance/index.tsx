import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import DebankIcon from 'components/icons/DebankIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { publicClient } from 'state/chain'
import { Badge, Box, Link, Text } from 'theme-ui'
import { StringMap } from 'types'
import {
  formatCurrency,
  formatUsdCurrencyCell,
  getProposalTitle,
  shortenAddress,
  shortenString,
} from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { ChainId } from 'utils/chains'
import {
  PROPOSAL_STATES,
  formatConstant,
  supportedChainList,
} from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'
import { getProposalStatus } from 'views/governance/views/proposal-detail/atom'

const explorerProposalsQuery = gql`
  query getAllProposals {
    proposals(orderBy: creationTime, orderDirection: desc) {
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
      governance {
        rToken {
          id
          token {
            symbol
          }
        }
      }
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

export interface ProposalRecord {
  id: string
  description: string
  creationTime: string
  state: string
  governance: string
  forWeightedVotes: string
  againstWeightedVotes: string
  quorumVotes: string
  startBlock: string
  endBlock: string
  status: string
  rTokenAddress: string
  rTokenSymbol: string
}

const chainBlocksAtom = atomWithLoadable(async () => {
  const result = await Promise.all(
    supportedChainList.map((chain) =>
      publicClient({ chainId: chain }).getBlockNumber()
    )
  )

  return supportedChainList.reduce((acc, chain, index) => {
    acc[chain] = Number(result[index])
    return acc
  }, {} as Record<number, number>)
})

const useProposals = () => {
  const blocks = useAtomValue(chainBlocksAtom)
  const { data, error } = useMultichainQuery(explorerProposalsQuery)

  return useMemo(() => {
    if (!data) return []

    const proposals: ProposalRecord[] = []

    for (const chain of supportedChainList) {
      if (data[chain]) {
        proposals.push(
          ...data[chain].proposals.map((entry: any) => {
            const status = getProposalStatus(entry, blocks?.[chain] || 0)

            return {
              ...entry,
              status,
              chain,
              rTokenAddress: entry.governance.rToken.id,
              rTokenSymbol: entry.governance.rToken.token.symbol,
            }
          })
        )
      }
    }

    return proposals
  }, [data, blocks])
}

const ExploreGovernance = () => {
  const data = useProposals()
  console.log('data', data)
  const columnHelper = createColumnHelper<ProposalRecord>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('rTokenSymbol', {
        header: t`Token`,
        cell: (data) => (
          <Box sx={{ minWidth: 150 }}>
            <TokenItem
              symbol={data.getValue()}
              logo={'/svgs/defaultLogo.svg'}
            />
          </Box>
        ),
      }),
      columnHelper.accessor('description', {
        header: t`Description`,
        cell: (data) => (
          <Text sx={{ textTransform: 'capitalize' }}>
            {getProposalTitle(data.getValue())}
          </Text>
        ),
      }),
      columnHelper.accessor('creationTime', {
        header: t`Created At`,
        cell: (data) => (
          <Text>{dayjs.unix(+data.getValue()).format('YYYY-M-D HH:mm')}</Text>
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
      // columnHelper.accessor('amount', {
      //   header: t`Amount`,
      //   cell: (data) => {
      //     const parsed = formatEther(data.getValue())
      //     let symbol = data.row.original.token.symbol
      //     if (
      //       data.row.original.type === 'STAKE' ||
      //       data.row.original.type === 'UNSTAKE' ||
      //       data.row.original.type === 'WITHDRAW' ||
      //       data.row.original.type === 'DEPOSIT' ||
      //       data.row.original.type === 'WITHDRAWAL'
      //     ) {
      //       symbol = 'RSR'
      //     }
      //     return `${formatCurrency(+parsed)} ${symbol}`
      //   },
      // }),
      // columnHelper.accessor('amountUSD', {
      //   header: t`USD Value`,
      //   cell: (data) => {
      //     if (isNaN(+data.getValue())) {
      //       return `$${data.getValue()}`
      //     }
      //     return formatUsdCurrencyCell(data as any)
      //   },
      // }),
      // columnHelper.accessor('timestamp', {
      //   header: t`Time`,
      //   cell: (data) => dayjs.unix(data.getValue()).format('YYYY-M-D HH:mm'),
      // }),
      // columnHelper.accessor('from.id', {
      //   header: t`From`,
      //   cell: (data) => {
      //     const address =
      //       data.row.original.type === 'MINT' ||
      //       data.row.original.type === 'ISSUE'
      //         ? data.row.original.to.id
      //         : data.getValue()
      //     return (
      //       <Box variant="layout.verticalAlign">
      //         <Link
      //           href={`https://debank.com/profile/${address}`}
      //           target="_blank"
      //           mr="2"
      //         >
      //           {shortenAddress(address)}
      //         </Link>
      //         <DebankIcon />
      //       </Box>
      //     )
      //   },
      // }),
      // columnHelper.accessor('chain', {
      //   header: t`Platform`,
      //   cell: (data) => {
      //     return (
      //       <Link
      //         href={getExplorerLink(
      //           data.row.original.hash,
      //           data.row.original.chain,
      //           ExplorerDataType.TRANSACTION
      //         )}
      //         target="_blank"
      //         sx={{ display: 'flex', alignItems: 'center' }}
      //       >
      //         <ChainLogo style={{ marginRight: 10 }} chain={data.getValue()} />
      //         {shortenString(data.row.original.hash)}
      //       </Link>
      //     )
      //   },
      // }),
    ],
    []
  )

  return (
    <Box mt={5} mx={[1, 4]}>
      <Box variant="layout.verticalAlign" mb={5}>
        <TransactionsIcon fontSize={32} />
        <Text ml="2" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Proposals</Trans>
        </Text>
      </Box>
      <Table
        sorting
        sortBy={[{ id: 'creationTime', desc: true }]}
        data={data}
        pagination={{ pageSize: 10 }}
        columns={columns}
        sx={{ borderRadius: '0 0 20px 20px' }}
        isLoading={!data.length}
        compact
      />
    </Box>
  )
}

export default ExploreGovernance
