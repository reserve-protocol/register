import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import YieldIcon from 'components/icons/YieldIcon'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import useRTokenPools, { Pool } from '../hooks/useRTokenPools'

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
      <Box variant="layout.verticalAlign" mb={7}>
        <YieldIcon fontSize={60} />
        <Box ml="2">
          <Text mb={1} variant="sectionTitle">
            RToken yield opportunities
          </Text>
          <Text variant="legend">
            DeFi yield opportunities for RTokens in Convex, Curve, Yearn & Beefy
          </Text>
        </Box>
      </Box>

      <Table isLoading={isLoading} compact columns={columns} data={data} />
    </Box>
  )
}

export default Earn
