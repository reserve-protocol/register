import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser'
import { useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Pool } from 'state/pools/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, LP_PROJECTS, NETWORKS } from 'utils/constants'
import { PROJECT_ICONS } from 'views/earn/utils/constants'

const useColumns = () => {
  const columnHelper = createColumnHelper<Pool>()
  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: t`Pool`,
        cell: (data) => {
          return (
            <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
              <Box
                variant="layout.verticalAlign"
                sx={{
                  cursor: 'pointer',
                  color: 'secondaryText',
                  ':hover': { color: 'text' },
                }}
                onClick={() => {
                  window.open(data.row.original.url, '_blank')
                  mixpanel.track('Viewed External Earn Link', {
                    Pool: data.row.original.symbol,
                    Protocol: data.row.original.project,
                  })
                }}
              >
                <StackTokenLogo tokens={data.row.original.underlyingTokens} />
                <Text ml="2" sx={{ textDecoration: 'underline' }}>
                  {data.getValue()}
                </Text>
              </Box>
            </Box>
          )
        },
      }),
      columnHelper.accessor('project', {
        header: t`Platform`,
        cell: (data) => (
          <Box variant="layout.verticalAlign">
            {PROJECT_ICONS[data.getValue()] ?? ''}
            <Text ml="2">
              {LP_PROJECTS[data.getValue()]?.name ?? data.getValue()}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor('chain', {
        header: t`Chain`,
        cell: (data) => {
          return (
            <Box pl="10px" variant="layout.verticalAlign">
              <ChainLogo
                fontSize={16}
                chain={NETWORKS[data.getValue().toLowerCase()]}
              />
              <Text ml="2" sx={{ display: ['block', 'none', 'block'] }}>
                {CHAIN_TAGS[NETWORKS[data.getValue().toLowerCase()]]}
              </Text>
            </Box>
          )
        },
      }),
      columnHelper.accessor('url', {
        header: t`My deposits`,
        cell: (data) => `$${0}`,
      }),
      columnHelper.accessor('apy', {
        header: () => {
          return (
            <Box variant="layout.verticalAlign">
              <Text mr={1}>APY</Text>
              <Help content="APY = Base APY + Reward APY. For non-autocompounding pools reinvesting is not accounted, in which case APY = APR." />
            </Box>
          )
        },
        cell: (data) => `${formatCurrency(data.getValue(), 1)}%`,
      }),
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('id', {
        header: '',
        cell: ({ row }) => {
          return row.getIsExpanded() ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )
        },
      }),
    ],
    [columnHelper]
  )
}

export default useColumns
