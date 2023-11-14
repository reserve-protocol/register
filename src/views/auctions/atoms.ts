import FacadeAct from 'abis/FacadeAct'
import FacadeRead from 'abis/FacadeRead'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import {
  chainIdAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenContractsAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { publicClient } from 'state/chain'
import { Token } from 'types'
import {
  FACADE_ACT_ADDRESS,
  FACADE_ADDRESS,
  RSR_ADDRESS,
} from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, formatUnits, zeroAddress } from 'viem'
import { readContracts } from 'wagmi/actions'

export interface Auction {
  sell: Token
  buy: Token
  amount: string
  minAmount: string
  trader: Address
  canStart: boolean
  output: number // estimated token output
}

type AuctionType = 'Revenue' | 'Recollaterization'

export enum TradeKind {
  DutchTrade,
  BatchTrade,
}

export const AUCTION_TYPES = {
  REVENUE: 'Revenue' as AuctionType,
  BACKING: 'Recollaterization' as AuctionType,
}

export interface AuctionToSettle {
  type: AuctionType
  trader: Address
  sell: Token
  buy: Token | null
}

export interface Trade {
  id: string
  amount: number
  auctionId?: number
  buying: string
  buyingTokenSymbol: string
  sellingTokenSymbol: string
  endAt: number
  selling: string
  startedAt: number
  worstCasePrice: number
}

export const tradesAtom = atom<{ current: Trade[]; ended: Trade[] }>({
  current: [],
  ended: [],
})
export const currentTradesAtom = atom((get) => get(tradesAtom).current)
export const endedTradesAtom = atom((get) => get(tradesAtom).ended)

export const selectedAuctionsAtom = atomWithReset<number[]>([])

export const auctionSessionAtom = atom(1)

const sidebarAtom = atom(false)
export const auctionSidebarAtom = atom(
  (get) => get(sidebarAtom),
  (get, set) => {
    const current = get(sidebarAtom)

    if (current) {
      set(sidebarAtom, false)
    } else {
      set(auctionSessionAtom, Math.random())
      set(sidebarAtom, true)
    }
  }
)

export const auctionPlatformAtom = atom<TradeKind>(TradeKind.BatchTrade)

export const auctionsToSettleAtom = atomWithLoadable(
  async (get): Promise<AuctionToSettle[] | null> => {
    get(auctionSessionAtom) // just for refresh sake
    const chainId = get(chainIdAtom)
    const rToken = get(rTokenAtom)
    const assets = get(rTokenAssetsAtom)
    const contracts = get(rTokenContractsAtom)

    if (!rToken || !assets || !contracts) {
      return null
    }

    const traders = [
      {
        ...contracts.rsrTrader,
        buy: assets[RSR_ADDRESS[chainId]].token,
        type: AUCTION_TYPES.REVENUE,
      },
      {
        ...contracts.rTokenTrader,
        buy: {
          symbol: rToken.symbol,
          address: rToken.address,
          name: rToken.name,
          decimals: rToken.decimals,
        },
        type: AUCTION_TYPES.REVENUE,
      },
      { ...contracts.backingManager, buy: null, type: AUCTION_TYPES.BACKING },
    ]

    try {
      const result = await (<Promise<[string[], string[], string[]]>>(
        readContracts({
          contracts: traders.map(({ address, version }) => ({
            abi: FacadeRead,
            address: FACADE_ADDRESS[chainId],
            functionName: 'auctionsSettleable',
            args: [address],
            chainId,
          })),
          allowFailure: false,
        })
      ))

      return result.reduce((auctionsToSettle, current, index) => {
        auctionsToSettle.push(
          ...current.map((erc20: string) => ({
            type: traders[index].type,
            trader: traders[index].address,
            sell: assets[erc20].token,
            buy: traders[index].buy,
          }))
        )

        return auctionsToSettle
      }, [] as AuctionToSettle[])
    } catch (e) {
      console.error('error here', e)
    }

    return null
  }
)

// TODO: This can be executed from the global context to display the number of auctions available
export const auctionsOverviewAtom = atomWithLoadable(
  async (
    get
  ): Promise<{
    availableAuctionRevenue: number
    unavailableAuctionRevenue: number
    availableAuctions: Auction[]
    unavailableAuctions: Auction[]
    recollaterization: Auction | null
  } | null> => {
    get(auctionSessionAtom) // just for refresh sake
    const contracts = get(rTokenContractsAtom)
    const assets = get(rTokenAssetsAtom)
    const rToken = get(rTokenAtom)
    const chainId = get(chainIdAtom)
    const client = publicClient({ chainId })

    if (!client || !contracts || !rToken || !assets) {
      return null
    }
    const call = {
      abi: FacadeAct,
      address: FACADE_ACT_ADDRESS[chainId],
    }

    const [
      { result: rsrRevenueOverview },
      { result: rTokenRevenueOverview },
      recoAuction,
    ] = await Promise.all([
      client.simulateContract({
        ...call,
        functionName: 'revenueOverview',
        args: [contracts.rsrTrader.address],
      }),
      client.simulateContract({
        ...call,
        functionName: 'revenueOverview',
        args: [contracts.rTokenTrader.address],
      }),
      (async (): Promise<[boolean, Address, Address, bigint]> => {
        try {
          const { result } = await client.simulateContract({
            ...call,
            functionName: 'nextRecollateralizationAuction',
            args: [contracts.backingManager.address, 0],
          })

          return result as any
        } catch (e) {
          console.log('error reco', e)
          return [false, zeroAddress, zeroAddress, 0n]
        }
      })(),
    ])

    const availableAuctions: Auction[] = []
    const unavailableAuctions: Auction[] = []
    let availableAuctionRevenue = 0
    let unavailableAuctionRevenue = 0

    for (let i = 0; i < rsrRevenueOverview[0].length; i++) {
      const erc20 = rsrRevenueOverview[0][i]
      const asset = assets[erc20]
      const rsrTradeAmount = formatUnits(
        rsrRevenueOverview[2][i],
        asset.token.decimals
      )
      const rTokenTradeAmount = formatUnits(
        rTokenRevenueOverview[2][i],
        asset.token.decimals
      )

      let auction

      if (asset.token.address !== RSR_ADDRESS[chainId]) {
        auction = {
          sell: asset.token,
          buy: assets[RSR_ADDRESS[chainId]].token,
          amount: rsrTradeAmount,
          minAmount: formatUnits(
            rsrRevenueOverview[3][i],
            asset.token.decimals
          ),
          trader: contracts.rsrTrader.address,
          canStart: rsrRevenueOverview[1][i],
          output:
            +rsrTradeAmount /
            (assets[RSR_ADDRESS[chainId]].priceUsd / asset.priceUsd),
        }
      }

      if (asset.token.address !== rToken.address) {
        auction = {
          sell: asset.token,
          buy: assets[rToken.address].token,
          amount: rTokenTradeAmount,
          minAmount: formatUnits(
            rTokenRevenueOverview[4][i],
            asset.token.decimals
          ),
          trader: contracts.rTokenTrader.address,
          canStart: rTokenRevenueOverview[1][i],
          output:
            +rTokenTradeAmount /
            (assets[rToken.address].priceUsd / asset.priceUsd),
        }
      }

      if (auction) {
        const amount = Number(auction.amount) * asset.priceUsd

        if (auction.canStart) {
          availableAuctions.push(auction)
          availableAuctionRevenue += amount
        } else {
          unavailableAuctions.push(auction)
          unavailableAuctionRevenue += amount
        }
      }
    }

    console.log('availableAuctions', {
      availableAuctions,
      unavailableAuctions,
      availableAuctionRevenue,
      unavailableAuctionRevenue,
    })

    let recollaterizationAuction = null

    if (recoAuction[0]) {
      const sell = assets[recoAuction[1]]
      const buy = assets[recoAuction[2]]
      const amount = formatUnits(recoAuction[3], sell.token.decimals)

      recollaterizationAuction = {
        sell: sell.token,
        buy: buy.token,
        amount,
        minAmount: '0',
        trader: contracts.backingManager.address,
        canStart: true,
        output: +amount / (buy.priceUsd / sell.priceUsd),
      }
    }

    return {
      availableAuctions,
      unavailableAuctions,
      availableAuctionRevenue,
      unavailableAuctionRevenue,
      recollaterization: recollaterizationAuction,
    }
  }
)
