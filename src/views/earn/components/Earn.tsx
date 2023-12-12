import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import YieldIcon from 'components/icons/YieldIcon'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import useRTokenPools, { Pool } from '../hooks/useRTokenPools'
import { Button } from 'components'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import Help from 'components/help'
import Curve from 'components/icons/logos/Curve'
import Convex from 'components/icons/logos/Convex'
import Yearn from 'components/icons/logos/Yearn'
import { LP_PROJECTS } from 'utils/constants'
import ChainLogo from 'components/icons/ChainLogo'
import { ChainId } from 'utils/chains'

const chainMap: Record<string, number> = {
  Ethereum: ChainId.Mainnet,
  Base: ChainId.Base,
}

const Earn = () => {
  const { data, isLoading } = useRTokenPools()
  const columnHelper = createColumnHelper<Pool>()

  const columns = useMemo(() => {
    const PROJECT_ICONS: Record<string, React.ReactElement> = {
      'yearn-finance': <Yearn />,
      'convex-finance': <Convex />,
      'curve-dex': <Curve />,
    }

    return [
      columnHelper.accessor('symbol', { header: t`Symbol` }),
      columnHelper.accessor('project', {
        header: t`Project`,
        cell: (data) => (
          <Box variant="layout.verticalAlign">
            {PROJECT_ICONS[data.getValue()] ?? ''}
            <Text ml="2">
              {LP_PROJECTS[data.getValue()]?.name ?? 'Unknown'}
            </Text>
          </Box>
        ),
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
        cell: (data) => `${formatCurrency(data.getValue(), 1)}%`,
      }),
      columnHelper.accessor('chain', {
        header: t`Chain`,
        cell: (data) => {
          return <ChainLogo chain={+chainMap[data.getValue()]} />
        },
      }),
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('url', {
        header: t`Link`,
        cell: (data) => (
          <Button
            small
            variant="muted"
            onClick={() => window.open(data.getValue(), '_blank')}
          >
            <Box variant="layout.verticalAlign">
              <Text mr="1">Pool</Text>
              <ExternalArrowIcon />
            </Box>
          </Button>
        ),
      }),
    ]
  }, [])

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

      <Table
        sorting
        sortBy={[{ id: 'apy', desc: true }]}
        isLoading={isLoading}
        compact
        columns={columns}
        data={data}
      />
    </Box>
  )
}

export default Earn
