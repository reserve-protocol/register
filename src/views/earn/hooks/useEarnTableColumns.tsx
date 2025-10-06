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
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, LP_PROJECTS, NETWORKS } from 'utils/constants'
import Sky from '@/components/icons/logos/Sky'
import Origin from '@/components/icons/logos/Origin'
import { cn } from '@/lib/utils'

export const PROJECT_ICONS: Record<string, React.ReactElement> = {
  'yearn-finance': <Yearn fontSize={16} />,
  'convex-finance': <Convex fontSize={16} />,
  'curve-dex': <Curve />,
  'aerodrome-v1': <Aerodrome />,
  'aerodrome-slipstream': <Aerodrome />,
  stakedao: <Stakedao fontSize={16} />,
  'stake-dao': <Stakedao fontSize={16} />,
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
  'sky-lending': <Sky />,
  'origin-ether': <Origin />,
}

const useEarnTableColumns = (compact: boolean) => {
  const columnHelper = createColumnHelper<Pool>()
  return useMemo(() => {
    return [
      columnHelper.accessor('symbol', {
        header: t`Pool`,
        cell: (data) => {
          return (
            <div className="flex items-center gap-3 min-w-[150px] xl:min-w-[200px]">
              <div
                className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => {
                  window.open(data.row.original.url, '_blank')
                  mixpanel.track('Viewed External Earn Link', {
                    Pool: data.row.original.symbol,
                    Protocol: data.row.original.project,
                  })
                }}
              >
                <StackTokenLogo tokens={data.row.original.underlyingTokens} outsource={true} />
                <span className="ml-2 underline text-sm md:text-base">
                  {data.getValue()}
                </span>
              </div>
              <div
                className="flex items-center cursor-pointer border border-border bg-card-alternative rounded-[50px] w-fit gap-1 px-2 py-1 opacity-30 hover:opacity-100"
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
                <img src="/svgs/defillama.svg" height={16} width={16} alt="DefiLlama" />
                <ArrowUpRight className="text-muted-foreground" size={14} />
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('project', {
        header: t`Project`,
        cell: (data) => (
          <div className="flex items-center min-w-[120px]">
            {PROJECT_ICONS[data.getValue()] ?? ''}
            <span className="ml-2 text-sm md:text-base">
              {LP_PROJECTS[data.getValue()]?.name ?? data.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('chain', {
        header: t`Chain`,
        cell: (data) => {
          return (
            <div className="pl-[10px] flex items-center min-w-[100px]">
              <ChainLogo
                fontSize={16}
                chain={NETWORKS[data.getValue().toLowerCase()]}
              />
              {!compact && (
                <span className="ml-2 text-sm md:text-base">
                  {CHAIN_TAGS[NETWORKS[data.getValue().toLowerCase()]]}
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('apy', {
        header: () => {
          return (
            <div className="flex items-center min-w-[80px]">
              <span className="mr-1">APY</span>
              <Help content="APY = Base APY + Reward APY. For non-autocompounding pools reinvesting is not accounted, in which case APY = APR." />
            </div>
          )
        },
        cell: (data) => <span className="min-w-[80px] inline-block text-sm md:text-base">{formatCurrency(data.getValue(), 1)}%</span>,
      }),
      columnHelper.accessor('apyBase', {
        header: () => {
          return (
            <div className="flex items-center min-w-[110px]">
              <span className="mr-1">Base APY</span>
              <Help content="Annualised percentage yield from trading fees/supplying. For dexes 24h fees are used and scaled those to a year." />
            </div>
          )
        },
        cell: (data) => <span className="min-w-[80px] inline-block text-sm md:text-base">{formatCurrency(data.getValue(), 1)}%</span>,
        meta: { className: 'hidden xl:table-cell' },
      }),
      columnHelper.accessor('apyReward', {
        header: () => {
          return (
            <div className="flex items-center min-w-[130px]">
              <span className="mr-1">Reward APY</span>
              <Help content="Annualised percentage yield from incentives" />
            </div>
          )
        },
        cell: (data) => (
          <span className="min-w-[80px] inline-block text-sm md:text-base">
            {`${formatCurrency(data.getValue(), 1)}%`}
          </span>
        ),
        meta: { className: 'hidden xl:table-cell' },
      }),
      columnHelper.accessor('tvlUsd', {
        header: t`TVL`,
        cell: (data) => <span className="min-w-[100px] inline-block text-sm md:text-base">${formatCurrency(data.getValue(), 0)}</span>,
      }),
    ]
  }, [compact])
}

export default useEarnTableColumns
