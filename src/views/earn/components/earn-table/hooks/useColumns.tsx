import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useMemo } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Circle,
  Zap,
} from 'react-feather'
import { balancesAtom } from 'state/atoms'
import { Pool } from 'state/pools/atoms'
import { colors } from 'theme'
import { Box, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, LP_PROJECTS, NETWORKS } from 'utils/constants'
import { getAddress } from 'viem'
import {
  PROJECT_ICONS,
  ZAP_EARN_POOLS,
  ZAP_EARN_POOLS_IDS,
} from 'views/earn/utils/constants'

const useColumns = () => {
  const columnHelper = createColumnHelper<Pool>()
  const balances = useAtomValue(balancesAtom)

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
                onClick={(e) => {
                  e.stopPropagation()
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
                onClick={(e) => {
                  e.stopPropagation()
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
              <Text ml="2" sx={{ display: ['block', 'none', 'block'] }}>
                {CHAIN_TAGS[NETWORKS[data.getValue().toLowerCase()]]}
              </Text>
            </Box>
          )
        },
      }),
      columnHelper.accessor('url', {
        header: t`My deposits`,
        cell: ({
          row: {
            original: { id, chain },
          },
        }) => {
          const chainId = NETWORKS[chain.toLowerCase()]
          const tokenOut: string =
            ZAP_EARN_POOLS[chainId]?.[id]?.out?.address || ''
          const balance = tokenOut
            ? balances[getAddress(tokenOut)]?.balance || '0'
            : '0'
          return (
            <Box sx={{ textAlign: 'end' }}>
              {formatCurrency(Number(balance), 5, {
                minimumFractionDigits: 0,
              })}
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
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('id', {
        header: '',
        cell: ({ row }) => {
          return (
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 1, width: 100, justifyContent: 'end' }}
            >
              {ZAP_EARN_POOLS_IDS.includes(row.original.id) && (
                <Box
                  variant="layout.verticalAlign"
                  sx={{
                    bg: 'cardAlternative',
                    borderRadius: '18px',
                    border: '1px solid',
                    borderColor: 'border',
                    px: 2,
                    py: 1,
                    gap: 1,
                    color: 'accentInverted',
                  }}
                >
                  <Zap
                    size={14}
                    strokeWidth={1.2}
                    fill={colors.accentInverted}
                  />
                  <Circle
                    size={7}
                    strokeWidth={1.2}
                    fill={colors.accentInverted}
                  />
                </Box>
              )}
              {row.getIsExpanded() ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Box>
          )
        },
      }),
    ],
    [columnHelper]
  )
}

export default useColumns
