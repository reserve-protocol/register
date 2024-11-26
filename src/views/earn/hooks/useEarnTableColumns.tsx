import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { Pool } from 'state/pools/atoms'
import { colors } from 'theme'
import { Box, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, LP_PROJECTS, NETWORKS } from 'utils/constants'
import { PROJECT_ICONS } from '../utils/constants'

export const columnVisibility = []

export const compactColumnVisibility = [
  '',
  '',
  ['none', 'table-cell'],
  '',
  ['none', 'none', 'none', 'table-cell'],
  ['none', 'none', 'none', 'table-cell'],
  ['none', 'table-cell'],
]


const useEarnTableColumns = (compact: boolean) => {
  const columnHelper = createColumnHelper<Pool>()
  return useMemo(() => {
    return [
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
              <Box
                variant="layout.verticalAlign"
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'border',
                  backgroundColor: 'cardAlternative',
                  borderRadius: '50px',
                  width: 'fit-content',
                  gap: 1,
                  px: 2,
                  py: 1,
                  opacity: 0.3,
                  ':hover': {
                    opacity: 1,
                  },
                }}
                onClick={() => {
                  window.open(
                    `https://defillama.com/yields/pool/${data.row.original.id}`,
                    '_blank'
                  )
                  mixpanel.track('Viewed DefiLlama Link', {
                    Pool: data.row.original.symbol,
                    Protocol: data.row.original.project,
                  })
                }}
              >
                <Image src="/svgs/defillama.svg" height={16} width={16} />
                <ArrowUpRight color={colors.secondaryText} size={14} />
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
              {!compact && (
                <Text ml="2" sx={{ display: ['block', 'none', 'block'] }}>
                  {CHAIN_TAGS[NETWORKS[data.getValue().toLowerCase()]]}
                </Text>
              )}
            </Box>
          )
        },
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
      columnHelper.accessor('apyBase', {
        header: () => {
          return (
            <Box variant="layout.verticalAlign">
              <Text mr={1}>Base APY</Text>
              <Help content="Annualised percentage yield from trading fees/supplying. For dexes 24h fees are used and scaled those to a year." />
            </Box>
          )
        },
        cell: (data) => `${formatCurrency(data.getValue(), 1)}%`,
      }),
      columnHelper.accessor('apyReward', {
        header: () => {
          return (
            <Box variant="layout.verticalAlign">
              <Text mr={1}>Reward APY</Text>
              <Help content="Annualised percentage yield from incentives" />
            </Box>
          )
        },
        cell: (data) => (
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, minWidth: '156px' }}
          >
            {`${formatCurrency(data.getValue(), 1)}%`}
          </Box>
        ),
      }),
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
    ]
  }, [compact])
}

export default useEarnTableColumns
