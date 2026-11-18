import rtokens from '@reserve-protocol/rtokens'
import FacadeRead from 'abis/FacadeRead'
import { useMemo } from 'react'
import { Trader } from 'types'
import { FACADE_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address, formatEther, formatUnits } from 'viem'
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

export type RevenueCollateral = {
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

export type RevenueDetail = {
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

export type Revenue = {
  tokens: RevenueDetail[]
  networks: { trades: number; revenue: number; chain: number }[]
  trades: number
  outstandingTrades: number
  revenue: number
}

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
  const { data: mainnet, isPending: mainnetPending } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Mainnet],
    functionName: 'revenues',
    chainId: ChainId.Mainnet,
    args: [Object.keys(rtokens[ChainId.Mainnet]) as Address[]],
  })
  const { data: base, isPending: basePending } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Base],
    functionName: 'revenues',
    chainId: ChainId.Base,
    args: [Object.keys(rtokens[ChainId.Base]) as Address[]],
  })
  const { data: arbitrum, isPending: arbitrumPending } = useReadContract({
    abi: FacadeRead,
    address: FACADE_ADDRESS[ChainId.Arbitrum],
    functionName: 'revenues',
    chainId: ChainId.Arbitrum,
    args: [Object.keys(rtokens[ChainId.Arbitrum]) as Address[]],
  })

  return useMemo(() => {
    if (mainnetPending || basePending || arbitrumPending) return undefined

    const parsedData = {
      [ChainId.Mainnet]: parseRevenue(mainnet ?? [], ChainId.Mainnet),
      [ChainId.Base]: parseRevenue(base ?? [], ChainId.Base),
      [ChainId.Arbitrum]: parseRevenue(arbitrum ?? [], ChainId.Arbitrum),
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
  }, [base, mainnet, arbitrum, mainnetPending, basePending, arbitrumPending])
}

export default useAvailableRevenue
