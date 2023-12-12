import rtokens from '@lc-labs/rtokens'
import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import { Table } from 'components/table'
import { useEffect, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency } from 'utils'

interface Pool {
  symbol: string
  apy: number
  apyBase: number
  stablecoin: boolean
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: string[]
}

const listedRTokens = Object.values(rtokens).reduce((acc, curr) => {
  return { ...acc, ...curr }
}, {} as StringMap)

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')

  return useMemo(() => {
    const pools: Pool[] = []

    if (data) {
      for (const pool of data.data) {
        const rToken = pool.underlyingTokens?.find(
          (token: string) => !!listedRTokens[token]
        )

        if (rToken && pool.project !== 'reserve') {
          pools.push(pool)
        }
      }
    }

    return { data: pools, isLoading }
  }, [data, isLoading])
}

const Earn = () => {
  const { data, isLoading } = useRTokenPools()
  const columnHelper = createColumnHelper<Pool>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', { header: t`Symbol` }),
      columnHelper.accessor('project', { header: t`Project` }),
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('apy', {
        header: t`APY`,
        cell: (data) => `${formatCurrency(data.getValue(), 1)}%`,
      }),
      columnHelper.accessor('chain', { header: t`Chain` }),
    ],
    []
  )

  console.log('data', data)

  // hy
  // c8815168-ba35-4e7c-b7b1-a0b33b6c73bc
  return (
    <Box variant="layout.wrapper" p={[1, 4]} py={[1, 7]}>
      <Text ml="3" mb={5} variant="sectionTitle">
        Pools
      </Text>
      <Table columns={columns} data={data} />
    </Box>
  )
}

export default Earn
