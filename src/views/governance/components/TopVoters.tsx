import { t, Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { Table } from 'components/table'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import { useEnsAddresses } from 'hooks/useEnsAddresses'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrencyCell, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

// TODO: Filter zero address from mappings on theGraph side
const query = gql`
  query getVoters($id: String!) {
    delegates(
      first: 10
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
  const { data, error } = useQuery(
    rToken?.address && !rToken.isRSV ? query : null,
    {
      id: rToken?.address.toLowerCase(),
    }
  )

  const addresses = data?.delegates?.map((delegate: any) => delegate.address)
  const ensRes: string[] = useEnsAddresses(addresses || [])

  return useMemo(() => {
    const delegatesWithEns = data?.delegates?.map(
      (delegate: any, idx: number) => {
        const ens = ensRes[idx]
        return {
          ...delegate,
          displayAddress: !!ens ? ens : shortenAddress(delegate.address),
        }
      }
    )
    return {
      data: delegatesWithEns ?? [],
      error: !!error,
      loading: !data?.delegates && !error,
    }
  }, [JSON.stringify(data), ensRes])
}

const TopVoters = (props: BoxProps) => {
  const { data } = useVoters()

  const columns = useMemo(
    () => [
      {
        Header: t`Address`,
        Cell: ({ row }: any) => {
          const { displayAddress, address } = row.original
          return (
            <Box variant="layout.verticalAlign">
              <Text>{displayAddress}</Text>
              <GoTo
                href={getExplorerLink(address, 1, ExplorerDataType.ADDRESS)}
              />
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
      variant="layout.card"
      p={2}
      sx={{ backgroundColor: 'contentBackground' }}
      {...props}
    >
      <Text variant="title" p={3}>
        <Trans>Top voting addresses</Trans>
      </Text>
      <Table
        mt={4}
        p={0}
        maxHeight={420}
        compact
        columns={columns}
        data={data}
      />
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
            <Trans>No voters at this moment...</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TopVoters
