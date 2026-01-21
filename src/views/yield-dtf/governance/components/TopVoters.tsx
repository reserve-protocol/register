import { t, Trans } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import GoTo from '@/components/ui/go-to'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { Table } from '@/components/ui/legacy-table'
import { gql } from 'graphql-request'
import { useEnsAddresses } from 'hooks/useEnsAddresses'
import useQuery from 'hooks/use-query'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { formatCurrencyCell, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'

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

interface TopVotersProps {
  className?: string
}

const TopVoters = ({ className }: TopVotersProps) => {
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
            <div className="flex items-center">
              <span>{displayAddress}</span>
              <GoTo
                href={getExplorerLink(
                  address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
              />
            </div>
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
            <span>
              {+(
                (delegatedVotes / +formatEther(totalTokenSupply)) *
                100
              ).toFixed(2) || 0}
              %
            </span>
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
    <div
      className={`rounded-[20px] p-2 bg-background border-[3px] border-secondary ${className || ''}`}
    >
      <h2 className="text-2xl font-bold p-4">
        <Trans>Top voting addresses</Trans>
      </h2>
      <Table columns={columns} data={data} className="rounded-3xl pt-6" />
      {!data.length && (
        <div className="py-6 mt-4 text-center">
          <EmptyBoxIcon />
          <span className="mt-4 block text-muted-foreground">
            <Trans>No voters at this moment...</Trans>
          </span>
        </div>
      )}
    </div>
  )
}

export default TopVoters
