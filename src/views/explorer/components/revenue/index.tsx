import rtokens from '@reserve-protocol/rtokens'
import { createColumnHelper } from '@tanstack/react-table'
import FacadeRead from 'abis/FacadeRead'
import CollapsableBox from 'components/boxes/CollapsableBox'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { useCallback, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Link, Text } from 'theme-ui'
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
import { Button } from 'components'
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
  buy: string // shorthand
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
  <Box
    variant="layout.verticalAlign"
    sx={{
      display: ['none', 'flex'],
      backgroundColor: 'rgba(0, 82, 255, 0.06)',
      border: '1px solid',
      borderColor: 'rgba(0, 82, 255, 0.20)',
      borderRadius: '50px',
      padding: '4px 8px',
      gap: 1,
    }}
  >
    <ChainLogo chain={chain} fontSize={12} />
    <Text sx={{ fontSize: 12 }} color="#627EEA">
      {CHAIN_TAGS[chain] + ' Native'}
    </Text>
  </Box>
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

    // RSR Trader
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

    return undefined // fetching...
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
          <Link
            href={getExplorerLink(
              data.getValue(),
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            sx={{ textDecoration: 'underline' }}
          >
            <TokenItem
              symbol={data.row.original.rTokenSymbol}
              logo={data.row.original.rTokenLogo}
              chainId={data.row.original.chain}
            />
          </Link>
        ),
      }),
      columnHelper.accessor('buy', {
        header: 'Buy',
        cell: (data) => (
          <Link
            href={getExplorerLink(
              data.row.original.buyAddress,
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            sx={{ textDecoration: 'underline' }}
          >
            <TokenItem
              symbol={data.getValue()}
              logo={data.row.original.buyLogo}
            />
          </Link>
        ),
      }),
      columnHelper.accessor('symbol', {
        header: 'Sell',
        cell: (data) => (
          <Link
            href={getExplorerLink(
              data.row.original.address,
              data.row.original.chain,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            sx={{ textDecoration: 'underline' }}
          >
            <TokenItem
              symbol={data.getValue()}
              logo={data.row.original.sellLogo}
            />
          </Link>
        ),
      }),
      columnHelper.accessor('surplus', {
        header: 'Surplus',
        cell: (data) => (
          <Text>
            {formatCurrency(data.getValue())} {data.row.original.symbol}
          </Text>
        ),
      }),
      columnHelper.accessor('minTrade', {
        header: 'Min. Trade',
        cell: (data) => (
          <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
            {data.row.original.surplus >= data.row.original.minTrade ? (
              <Check size={16} strokeWidth={3} color="#11BB8D" />
            ) : (
              <X size={16} color="#FF8A00" />
            )}
            <Text>
              {formatCurrency(data.getValue())} {data.row.original.symbol}
            </Text>
          </Box>
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
            small
            variant="bordered"
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
      compact
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
  const handleRun = () => {
    window.open(
      getTokenRoute(data.address, data.chain, ROUTES.AUCTIONS),
      '_blank'
    )
  }

  return (
    <CollapsableBox
      variant="layout.borderBox"
      p={[3, 4]}
      sx={{ background: 'contentBackground' }}
      header={
        <Box
          variant="layout.verticalAlign"
          sx={{ flexWrap: 'wrap', gap: 3 }}
          pr={4}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2 }}
            onClick={handleRun}
            role="button"
            mr="auto"
          >
            <TokenLogo width={24} src={data.logo} />
            <Text
              variant="strong"
              sx={{ fontSize: 3, textDecoration: 'underline' }}
            >
              {data.symbol}
            </Text>
            <ChainLogo chain={data.chain} />
          </Box>
          <Box variant="layout.verticalAlign" sx={{ gap: 3, flexWrap: 'wrap' }}>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="legend">Trades:</Text>
              <Text variant="strong">{data.n}</Text>
              <Text variant="legend" sx={{ fontWeight: 500 }}>
                ({data.outstandingTrades} available)
              </Text>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="legend">Amount:</Text>
              <Text variant="strong">${formatCurrency(data.total)}</Text>
            </Box>
            <Button small variant="bordered" onClick={handleRun}>
              Run
            </Button>
          </Box>
        </Box>
      }
    >
      <TradesTable rToken={false} pagination={false} trades={data.trades} />
    </CollapsableBox>
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
    <Box>
      <Box
        variant="layout.borderBox"
        p={[2, 3]}
        sx={{
          gap: [2, 3],
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="legend">Trades:</Text>
          <Text variant="strong">{data?.trades ?? 0}</Text>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="legend">Available Trades:</Text>
          <Text variant="strong">{data?.outstandingTrades ?? 0}</Text>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="legend">Revenue:</Text>
          <Text variant="strong">${formatCurrency(data?.revenue ?? 0)}</Text>
        </Box>
      </Box>

      {type === 'grid' ? (
        <Flex mt={5} sx={{ gap: 3, flexDirection: 'column' }}>
          {data.tokens.map((token) => (
            <RTokenRevenueOverview data={token} key={token.address} />
          ))}
        </Flex>
      ) : (
        <Box mt={5}>
          <TradesTable trades={trades} />
        </Box>
      )}
    </Box>
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
    <Box mt={[3, 5]} mx={[2, 3]}>
      <Box variant="layout.verticalAlign" mb={5}>
        <AuctionsIcon fontSize={32} />
        <Text ml="2" as="h2" variant="title" sx={{ fontSize: 4 }}>
          Revenue
        </Text>
        <Menu current={current} onChange={handleChange} />
      </Box>
      <RevenueOverview data={data} type={current} />
    </Box>
  )
}

export default AvailableRevenue
