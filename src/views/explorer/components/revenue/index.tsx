import rtokens from '@reserve-protocol/rtokens'
import { createColumnHelper } from '@tanstack/react-table'
import FacadeRead from 'abis/FacadeRead'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Table } from '@/components/ui/legacy-table'
import TokenItem from 'components/token-item'
import { useCallback, useMemo, useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { Trader } from 'types'
import { formatCurrency, formatUsdCurrencyCell, getTokenRoute } from 'utils'
import { FACADE_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, formatEther, formatUnits } from 'viem'
import TabMenu from 'components/tab-menu'
import CirclesIcon from 'components/icons/CirclesIcon'
import ChainLogo from 'components/icons/ChainLogo'
import { Button } from '@/components/ui/button'
import { useReadContract } from 'wagmi'

type RevenueResponse = {
  balance: bigint
  buy: Address
  minTradeAmount: bigint
  rToken: Address
  sell: Address
  sellDecimals: number
  settleable: boolean
  symbol: string
  trader: Address
  volume: bigint
}

type RevenueCollateral = {
  address: Address
  symbol: string
  surplus: number
  minTrade: number
  value: number
  buy: string
  trader: Trader
  chain: number
  buyAddress: Address
  buyLogo: string
  sellLogo?: string
  rTokenLogo: string
  rTokenSymbol: string
  rTokenAddress: string
}

type RevenueDetail = {
  address: Address
  symbol: string
  logo: string
  stakersRevenue: number
  holdersRevenue: number
  melting: number
  outstandingTrades: number
  total: number
  n: number
  trades: RevenueCollateral[]
  chain: number
}

type RTokenRevenue = {
  [key: string]: RevenueDetail
}

type Revenue = {
  tokens: RevenueDetail[]
  networks: { trades: number; revenue: number; chain: number }[]
  trades: number
  outstandingTrades: number
  revenue: number
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <div className="hidden md:flex items-center bg-primary/5 border border-primary/20 rounded-full py-1 px-2 gap-1">
    <ChainLogo chain={chain} fontSize={12} />
    <span className="text-xs text-primary">{CHAIN_TAGS[chain] + ' Native'}</span>
  </div>
)

const parseRevenue = (trades: readonly RevenueResponse[], chain: number) => {
  const revenue = {
    totalRevenue: 0,
    availableTrades: 0,
    outstandingTrades: 0,
    tokens: Object.values(rtokens[chain]).reduce((acc, rToken) => {
      acc[rToken.address] = {
        address: rToken.address as Address,
        symbol: rToken.symbol,
        stakersRevenue: 0,
        holdersRevenue: 0,
        melting: 0,
        total: 0,
        n: 0,
        outstandingTrades: 0,
        trades: [],
        logo: `/svgs/${rToken.logo?.toLowerCase() ?? 'defaultLogo.svg'}`,
        chain,
      }

      return acc
    }, {} as RTokenRevenue),
  }

  for (const trade of trades) {
    if (
      !revenue.tokens[trade.rToken] ||
      (trade.rToken === trade.buy && trade.sell === trade.rToken) ||
      trade.buy === trade.sell ||
      trade.balance <= 0n
    ) {
      continue
    }

    const amount = Number(formatEther(trade.volume))
    const isStakerTrader = trade.buy === RSR_ADDRESS[chain]

    revenue.tokens[trade.rToken].total += amount
    revenue.totalRevenue += amount
    revenue.availableTrades += 1

    if (isStakerTrader) {
      revenue.tokens[trade.rToken].stakersRevenue += amount
    } else {
      revenue.tokens[trade.rToken].holdersRevenue += amount
    }

    if (trade.balance > trade.minTradeAmount) {
      revenue.tokens[trade.rToken].outstandingTrades += 1
      revenue.outstandingTrades += 1
    }

    revenue.tokens[trade.rToken].n += 1
    revenue.tokens[trade.rToken].trades.push({
      address: trade.sell,
      symbol: trade.symbol,
      surplus: +formatUnits(trade.balance, trade.sellDecimals),
      minTrade: +formatUnits(trade.minTradeAmount, trade.sellDecimals),
      value: amount,
      buyAddress: isStakerTrader ? RSR_ADDRESS[chain] : trade.rToken,
      buy: isStakerTrader ? 'RSR' : revenue.tokens[trade.rToken].symbol,
      buyLogo: isStakerTrader
        ? '/svgs/rsr.svg'
        : revenue.tokens[trade.rToken].logo,
      sellLogo:
        trade.sell === trade.rToken
          ? revenue.tokens[trade.rToken].logo
          : undefined,
      trader: trade.buy === RSR_ADDRESS[chain] ? 'rsrTrader' : 'rTokenTrader',
      chain,
      rTokenAddress: trade.rToken,
      rTokenLogo: revenue.tokens[trade.rToken].logo,
      rTokenSymbol: revenue.tokens[trade.rToken].symbol,
    })
  }

  return revenue
}

const useAvailableRevenue = (): Revenue | undefined => {
  const { data: mainnet } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Mainnet],
    functionName: 'revenues',
    chainId: ChainId.Mainnet,
    args: [Object.keys(rtokens[ChainId.Mainnet]) as Address[]],
  })
  const { data: base } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Base],
    functionName: 'revenues',
    chainId: ChainId.Base,
    args: [Object.keys(rtokens[ChainId.Base]) as Address[]],
  })
  const { data: arbitrum } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Arbitrum],
    functionName: 'revenues',
    chainId: ChainId.Arbitrum,
    args: [Object.keys(rtokens[ChainId.Arbitrum]) as Address[]],
  })

  return useMemo(() => {
    if (mainnet && base && arbitrum) {
      const parsedData = {
        [ChainId.Mainnet]: parseRevenue(mainnet, ChainId.Mainnet),
        [ChainId.Base]: parseRevenue(base, ChainId.Base),
        [ChainId.Arbitrum]: parseRevenue(arbitrum, ChainId.Arbitrum),
      }

      const result = Object.keys(parsedData).reduce(
        (acc, chain) => {
          const revenue = parsedData[+chain].totalRevenue
          const trades = parsedData[+chain].availableTrades
          const outstandingTrades = parsedData[+chain].outstandingTrades

          acc.networks.push({
            chain: +chain,
            revenue,
            trades,
          })
          acc.revenue += revenue
          acc.outstandingTrades += outstandingTrades
          acc.trades += trades
          acc.tokens.push(...Object.values(parsedData[+chain].tokens))

          return acc
        },
        {
          revenue: 0,
          trades: 0,
          outstandingTrades: 0,
          networks: [],
          tokens: [],
        } as Revenue
      )

      result.tokens.sort((a, b) => b.total - a.total)

      return result
    }

    return undefined
  }, [base, mainnet, arbitrum])
}

const TradesTable = ({
  trades,
  rToken = true,
  pagination = true,
}: {
  trades: RevenueCollateral[]
  rToken?: boolean
  pagination?: boolean
}) => {
  const columnHelper = createColumnHelper<RevenueCollateral>()

  const columns = useMemo(() => {
    const c = [
      columnHelper.accessor('rTokenAddress', {
        header: 'RToken',
        cell: (data) => (
          <a
            href={getExplorerLink(
              data.getValue(),
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            className="underline"
          >
            <TokenItem
              symbol={data.row.original.rTokenSymbol}
              logo={data.row.original.rTokenLogo}
              chainId={data.row.original.chain}
            />
          </a>
        ),
      }),
      columnHelper.accessor('buy', {
        header: 'Buy',
        cell: (data) => (
          <a
            href={getExplorerLink(
              data.row.original.buyAddress,
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            className="underline"
          >
            <TokenItem
              symbol={data.getValue()}
              logo={data.row.original.buyLogo}
            />
          </a>
        ),
      }),
      columnHelper.accessor('symbol', {
        header: 'Sell',
        cell: (data) => (
          <a
            href={getExplorerLink(
              data.row.original.address,
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            className="underline"
          >
            <TokenItem
              symbol={data.getValue()}
              logo={data.row.original.sellLogo}
            />
          </a>
        ),
      }),
      columnHelper.accessor('surplus', {
        header: 'Surplus',
        cell: (data) => (
          <span>
            {formatCurrency(data.getValue())} {data.row.original.symbol}
          </span>
        ),
      }),
      columnHelper.accessor('minTrade', {
        header: 'Min. Trade',
        cell: (data) => (
          <div className="flex items-center gap-2">
            {data.row.original.surplus >= data.row.original.minTrade ? (
              <Check size={16} strokeWidth={3} color="#11BB8D" />
            ) : (
              <X size={16} color="#FF8A00" />
            )}
            <span>
              {formatCurrency(data.getValue())} {data.row.original.symbol}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('value', {
        header: 'Amount',
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('address', {
        header: '',
        cell: (data) => (
          <Button
            size="sm"
            variant="outline"
            className="border-2"
            onClick={() => {
              window.open(
                getTokenRoute(
                  data.row.original.address,
                  data.row.original.chain,
                  ROUTES.AUCTIONS
                ),
                '_blank'
              )
            }}
          >
            Run
          </Button>
        ),
      }),
    ]

    return c
  }, [rToken])

  return (
    <Table
      data={trades}
      columns={columns as any}
      sorting
      sortBy={[{ id: 'value', desc: true }]}
      columnVisibility={
        !rToken ? ['none', '', '', '', '', '', 'none'] : undefined
      }
      pagination={pagination}
    />
  )
}

const RTokenRevenueOverview = ({ data }: { data: RevenueDetail }) => {
  const [isOpen, setOpen] = useState(false)

  const handleRun = () => {
    window.open(
      getTokenRoute(data.address, data.chain, ROUTES.AUCTIONS),
      '_blank'
    )
  }

  return (
    <div className="border border-border rounded-[20px] p-4 md:p-6 bg-secondary">
      {/* Collapsable header */}
      <div
        className="flex cursor-pointer w-full"
        onClick={() => setOpen(!isOpen)}
      >
        <div className="flex items-center flex-wrap gap-4 w-full pr-6">
          <div
            className="flex items-center gap-2 mr-auto cursor-pointer"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleRun()
            }}
            role="button"
          >
            <TokenLogo width={24} src={data.logo} />
            <span className="font-medium text-xl underline">{data.symbol}</span>
            <ChainLogo chain={data.chain} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Trades:</span>
              <span className="font-medium">{data.n}</span>
              <span className="text-muted-foreground font-medium">
                ({data.outstandingTrades} available)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${formatCurrency(data.total)}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleRun()
              }}
            >
              Run
            </Button>
          </div>
        </div>
        <div className="flex items-center ml-auto">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <>
          <div className="-mx-6 my-4 border-t border-border" />
          <TradesTable rToken={false} pagination={false} trades={data.trades} />
        </>
      )}
    </div>
  )
}

const Menu = ({
  current,
  onChange,
}: {
  current: string
  onChange(key: string): void
}) => {
  const items = useMemo(
    () => [
      {
        key: 'grid',
        label: 'RTokens',
        icon: <CirclesIcon color="currentColor" />,
      },
      {
        key: 'list',
        label: 'Trades',
        icon: <AuctionsIcon />,
      },
    ],
    []
  )

  return (
    <TabMenu
      active={current}
      items={items}
      collapse
      onMenuChange={onChange}
      ml="auto"
    />
  )
}

const RevenueOverview = ({
  data,
  type,
}: {
  data: Revenue | undefined
  type: string
}) => {
  const trades = useMemo(() => {
    return data?.tokens.flatMap((token) => token.trades) ?? []
  }, [data])

  if (!data) {
    return <Skeleton count={8} height={80} style={{ marginBottom: 20 }} />
  }

  return (
    <div>
      <div className="border border-border rounded-[20px] p-2 md:p-4 flex flex-wrap gap-2 md:gap-4 justify-center">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Trades:</span>
          <span className="font-medium">{data?.trades ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Available Trades:</span>
          <span className="font-medium">{data?.outstandingTrades ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-medium">${formatCurrency(data?.revenue ?? 0)}</span>
        </div>
      </div>

      {type === 'grid' ? (
        <div className="mt-8 flex flex-col gap-4">
          {data.tokens.map((token) => (
            <RTokenRevenueOverview data={token} key={token.address} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <TradesTable trades={trades} />
        </div>
      )}
    </div>
  )
}

const AvailableRevenue = () => {
  const data = useAvailableRevenue()
  const [current, setCurrent] = useState('grid')

  const handleChange = useCallback(
    (key: string) => {
      setCurrent(key)
    },
    [setCurrent]
  )

  return (
    <div className="mt-4 md:mt-8 mx-2 md:mx-4">
      <div className="flex items-center mb-8">
        <AuctionsIcon fontSize={32} />
        <h2 className="ml-2 text-xl font-medium">Revenue</h2>
        <Menu current={current} onChange={handleChange} />
      </div>
      <RevenueOverview data={data} type={current} />
    </div>
  )
}

export default AvailableRevenue
