import rtokens from '@reserve-protocol/rtokens'
import { createColumnHelper } from '@tanstack/react-table'
import FacadeRead from 'abis/FacadeRead'
import CollapsableBox from 'components/boxes/CollapsableBox'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { useCallback, useMemo, useState } from 'react'
import { Check, X } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Link, Text } from 'theme-ui'
import { Trader } from 'types'
import { formatCurrency, formatUsdCurrencyCell, getTokenRoute } from 'utils'
import { FACADE_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther, formatUnits } from 'viem'
import { Address, useContractRead } from 'wagmi'
import TabMenu from 'components/tab-menu'
import CirclesIcon from 'components/icons/CirclesIcon'

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
  revenue: number
}

const parseRevenue = (trades: readonly RevenueResponse[], chain: number) => {
  const revenue = {
    totalRevenue: 0,
    availableTrades: 0,
    tokens: Object.values(rtokens[chain]).reduce((acc, rToken) => {
      acc[rToken.address] = {
        address: rToken.address as Address,
        symbol: rToken.symbol,
        stakersRevenue: 0,
        holdersRevenue: 0,
        melting: 0,
        total: 0,
        n: 0,
        trades: [],
        logo: `/svgs/${rToken.logo?.toLowerCase() ?? 'defaultLogo.svg'}`,
        chain,
      }

      return acc
    }, {} as RTokenRevenue),
  }

  for (const trade of trades) {
    const amount = Number(formatEther(trade.volume))
    revenue.tokens[trade.rToken].total += amount
    revenue.totalRevenue += amount

    // Melting
    if (trade.rToken === trade.buy && trade.sell === trade.rToken) {
      revenue.tokens[trade.rToken].melting = amount
      continue
    }

    if (trade.buy === trade.sell || trade.balance <= 0n) continue
    revenue.availableTrades += 1
    const isStakerTrader = trade.buy === RSR_ADDRESS[chain]

    // RSR Trader
    if (isStakerTrader) {
      revenue.tokens[trade.rToken].stakersRevenue += amount
    } else {
      revenue.tokens[trade.rToken].holdersRevenue += amount
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
  // const { data: mainnet } = useContractRead({
  //   abi: FacadeRead,
  //   address: FACADE_ADDRESS[ChainId.Mainnet],
  //   functionName: 'revenues',
  //   chainId: ChainId.Mainnet,
  //   args: [Object.keys(rtokens[ChainId.Mainnet]) as Address[]],
  // })
  const { data: base } = useContractRead({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Base],
    functionName: 'revenues',
    chainId: ChainId.Base,
    args: [Object.keys(rtokens[ChainId.Base]) as Address[]],
  })

  // const { data: arbitrum } = useContractRead({
  //   abi: FacadeRead,
  //   address: FACADE_ADDRESS[ChainId.Arbitrum],
  //   functionName: 'revenues',
  //   chainId: ChainId.Arbitrum,
  //   args: [Object.keys(rtokens[ChainId.Arbitrum]) as Address[]],
  // })

  return useMemo(() => {
    // if (mainnet && base && arbitrum) {
    if (base) {
      const parsedData = {
        [ChainId.Base]: parseRevenue(base, ChainId.Base),
      }

      const result = Object.keys(parsedData).reduce(
        (acc, chain) => {
          const revenue = parsedData[+chain].totalRevenue
          const trades = parsedData[+chain].availableTrades

          acc.networks.push({
            chain: +chain,
            revenue,
            trades,
          })
          acc.revenue += revenue
          acc.trades += trades
          acc.tokens.push(...Object.values(parsedData[+chain].tokens))

          return acc
        },
        {
          revenue: 0,
          trades: 0,
          networks: [],
          tokens: [],
        } as Revenue
      )

      result.tokens.sort((a, b) => b.total - a.total)

      return result
    }

    return undefined // fetching...
  }, [base]) // TODO: Add other chains
}

const TradesTable = ({
  trades,
  rToken = true,
}: {
  trades: RevenueCollateral[]
  rToken?: boolean
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
      columnVisibility={!rToken ? ['none'] : undefined}
      pagination
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
            <ExternalArrowIcon />
          </Box>
          <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="legend">Melting:</Text>
              <Text variant="strong">${formatCurrency(data.melting)}</Text>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="legend">Trades:</Text>
              <Text variant="strong">{data.n}</Text>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="legend">Amount:</Text>
              <Text variant="strong">${formatCurrency(data.total)}</Text>
            </Box>
          </Box>
        </Box>
      }
    >
      <TradesTable rToken={false} trades={data.trades} />
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
      <Box variant="layout.borderBox" sx={{ gap: 3, display: 'flex' }}>
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="legend">Trades:</Text>
          <Text variant="strong">{data?.trades ?? 0}</Text>
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
    <Box variant="layout.tokenView">
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
