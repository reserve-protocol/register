import { t, Trans } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import GoTo from 'components/button/GoTo'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { Table } from 'components/table'
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
import { formatEther } from 'viem'

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

interface Voter {
  id: string
  address: string
  numberVotes: number
  delegatedVotes: number
  governance: {
    totalTokenSupply: bigint
  }
  displayAddress: string
}

// TODO: Proposal data casting?
const useVoters = () => {
  const rToken = useRToken()
  const { data, error } = useQuery(rToken?.main ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  const addresses = data?.delegates?.map((delegate: Voter) => delegate.address)
  const ensRes: string[] = useEnsAddresses(addresses || [])

  return useMemo(() => {
    const delegatesWithEns = data?.delegates?.map(
      (delegate: Voter, idx: number) => {
        const ens = ensRes[idx]
        return {
          ...delegate,
          displayAddress: !!ens ? ens : shortenAddress(delegate.address),
        }
      }
    )
    return {
      data: (delegatesWithEns ?? []) as Voter[],
      error: !!error,
      loading: !data?.delegates && !error,
    }
  }, [JSON.stringify(data), ensRes])
}

const TopVoters = (props: BoxProps) => {
  const { data } = useVoters()
  const chainId = useAtomValue(chainIdAtom)
  const columnHelper = createColumnHelper<Voter>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        header: t`Address`,
        cell: (data) => {
          const { displayAddress, address } = data.row.original
          return (
            <Box variant="layout.verticalAlign">
              <Text>{displayAddress}</Text>
              <GoTo
                href={getExplorerLink(
                  address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
              />
            </Box>
          )
        },
      }),
      columnHelper.accessor('delegatedVotes', {
        header: t`Votes`,
        cell: formatCurrencyCell,
      }),
      columnHelper.accessor('id', {
        header: t`Vote weight`,
        cell: (data) => {
          const {
            delegatedVotes,
            governance: { totalTokenSupply },
          } = data.row.original

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
      }),
      columnHelper.accessor('numberVotes', {
        header: t`Proposals voted`,
      }),
    ],
    [chainId]
  )

  return (
    <Box
      variant="layout.card"
      p={2}
      sx={{
        backgroundColor: 'background',
        border: '3px solid',
        borderColor: 'borderFocused',
      }}
      {...props}
    >
      <Text variant="sectionTitle" p={3}>
        <Trans>Top voting addresses</Trans>
      </Text>
      <Table mt={2} p={0} compact columns={columns} data={data} />
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
