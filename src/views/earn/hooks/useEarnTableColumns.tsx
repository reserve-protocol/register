import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import Beefy from 'components/icons/Beefy'
import Camelot from 'components/icons/Camelot'
import ChainLogo from 'components/icons/ChainLogo'
import Concentrator from 'components/icons/Concentrator'
import Aerodrome from 'components/icons/logos/Aerodrome'
import Balancer from 'components/icons/logos/Balancer'
import Convex from 'components/icons/logos/Convex'
import Curve from 'components/icons/logos/Curve'
import Dinero from 'components/icons/logos/Dinero'
import Dyson from 'components/icons/logos/Dyson'
import Ethena from 'components/icons/logos/Ethena'
import Extra from 'components/icons/logos/Extra'
import Merkl from 'components/icons/logos/Merkl'
import Morpho from 'components/icons/logos/Morpho'
import Stader from 'components/icons/logos/Stader'
import Stakedao from 'components/icons/logos/Stakedao'
import Uniswap from 'components/icons/logos/Uniswap'
import Yearn from 'components/icons/logos/Yearn'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import React, { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Pool } from 'state/pools/atoms'
import { colors } from 'theme'
import { Box, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, LP_PROJECTS, NETWORKS } from 'utils/constants'

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

export const PROJECT_ICONS: Record<string, React.ReactElement> = {
  'yearn-finance': <Yearn fontSize={16} />,
  'convex-finance': <Convex fontSize={16} />,
  'curve-dex': <Curve />,
  'aerodrome-v1': <Aerodrome />,
  'aerodrome-slipstream': <Aerodrome />,
  stakedao: <Stakedao fontSize={16} />,
  'uniswap-v3': <Uniswap fontSize={16} />,
  'balancer-v2': <Balancer fontSize={16} />,
  'extra-finance': <Extra fontSize={16} />,
  'camelot-v3': <Camelot />,
  beefy: <Beefy />,
  concentrator: <Concentrator />,
  dyson: <Dyson />,
  'morpho-blue': <Morpho />,
  merkl: <Merkl />,
  ethena: <Ethena />,
  'dinero-(pirex-eth)': <Dinero />,
  stader: <Stader />,
}

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
        header: t`Project`,
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
