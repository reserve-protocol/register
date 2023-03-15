import { t, Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { Table } from 'components/table'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrencyCell, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

// TODO: Filter zero address from mappings on theGraph side
const query = gql`
  query getVoters($id: String!) {
    delegates(
      where: {
        governance: $id
        address_not: "0x0000000000000000000000000000000000000000"
      }
      orderBy: "delegatedVotes"
      orderDirection: "desc"
    ) {
      id
      address
      numberVotes
      delegatedVotes
      governance {
        totalTokenSupply
      }
    }
  }
`

// TODO: Proposal data casting?
const useVoters = () => {
  const rToken = useRToken()
  const response = useQuery(rToken?.address && !rToken.isRSV ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  return useMemo(() => {
    const { data, error } = response

    return {
      data: data?.delegates ?? [],
      error: !!error,
      loading: !data?.delegates && !error,
    }
  }, [JSON.stringify(response)])
}

const TopVoters = (props: BoxProps) => {
  const { data } = useVoters()

  const columns = useMemo(
    () => [
      {
        Header: t`Rank`,
        accessor: 'id',
        Cell: ({ row }: any) => {
          return <Text>{row.index + 1}</Text>
        },
      },
      {
        Header: t`Address`,
        accessor: 'address',
        Cell: ({ value }: any) => {
          return (
            <Box variant="layout.verticalAlign">
              <Text>{shortenAddress(value)}</Text>
              <GoTo href={getExplorerLink(value, ExplorerDataType.ADDRESS)} />
            </Box>
          )
        },
      },
      {
        Header: t`Votes`,
        accessor: 'delegatedVotes',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`Vote weight`,
        Cell: ({ row }: any) => {
          const {
            delegatedVotes,
            governance: { totalTokenSupply },
          } = row.original

          return (
            <Text>
              {+(
                (delegatedVotes / +formatEther(totalTokenSupply)) *
                100
              ).toFixed(2) || 0}
              %
            </Text>
          )
        },
      },
      {
        Header: t`Proposals voted`,
        accessor: 'numberVotes',
      },
    ],
    [data]
  )

  return (
    <Box
      variant="layout.borderBox"
      sx={{ backgroundColor: 'contentBackground' }}
      {...props}
    >
      <Text variant="title">
        <Trans>Top voting addresses</Trans>
      </Text>
      <Table mt={4} maxHeight={420} compact columns={columns} data={data} />
      {!data.length && (
        <Box py={4} mt={3} sx={{ textAlign: 'center' }}>
          <EmptyBoxIcon />
          <Text
            mt={3}
            variant="legend"
            sx={{
              display: 'block',
            }}
          >
            No voters at this moment...
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TopVoters
