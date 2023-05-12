import { FacadeInterface } from 'abis'
import { Facade } from 'abis/types'
import { formatUnits } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import {
  getValidWeb3Atom,
  rTokenAssetERC20MapAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenContractsAtom,
} from 'state/atoms'
import { Token } from 'types'
import { getContract } from 'utils'
import { FACADE_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { simplifyLoadable } from 'utils/atoms/utils'

export interface Auction {
  sell: Token
  buy: Token
  amount: string
  minAmount: string
  trader: string
  canStart: boolean
  output: number // estimated token output
}

export const selectedAuctionsAtom = atom<number[]>([])

const accumulatedRevenue = loadable(
  atom(async (get) => {
    const { provider, chainId } = get(getValidWeb3Atom)
    const rToken = get(rTokenAtom)
    const assetMap = get(rTokenAssetERC20MapAtom)
    const assets = get(rTokenAssetsAtom)

    if (!provider || !rToken || !Object.keys(assets).length) {
      return 0
    }

    const contract = getContract(
      FACADE_ADDRESS[chainId],
      FacadeInterface,
      provider
    ) as Facade

    const { balances, balancesNeededByBackingManager, erc20s } =
      await contract.callStatic.balancesAcrossAllTraders(rToken.address)

    return erc20s.reduce((revenue, erc20, index) => {
      const priceUsd = assets[assetMap[erc20]]?.priceUsd || 0
      const decimals = assets[assetMap[erc20]]?.token.decimals || 18

      return (
        revenue +
        Number(
          formatUnits(
            balances[index].sub(balancesNeededByBackingManager[index]),
            decimals
          )
        ) *
          priceUsd
      )
    }, 0)
  })
)

const auctionsOverview = loadable(
  atom(
    async (
      get
    ): Promise<{
      revenue: Auction[]
      recollaterization: Auction | null
    } | null> => {
      const { provider, chainId } = get(getValidWeb3Atom)
      const { rsrTrader, rTokenTrader, backingManager } =
        get(rTokenContractsAtom)
      const assetMap = get(rTokenAssetERC20MapAtom)
      const assets = get(rTokenAssetsAtom)
      const rToken = get(rTokenAtom)

      if (
        !provider ||
        !rsrTrader ||
        !rTokenTrader ||
        !backingManager ||
        !rToken ||
        !Object.keys(assets).length
      ) {
        return null
      }

      const contract = getContract(
        FACADE_ADDRESS[chainId],
        FacadeInterface,
        provider
      ) as Facade

      const [rsrRevenueOverview, rTokenRevenueOverview, recoAuction] =
        await Promise.all([
          contract.callStatic.revenueOverview(rsrTrader),
          contract.callStatic.revenueOverview(rTokenTrader),
          contract.callStatic.nextRecollateralizationAuction(backingManager),
        ])

      const auctions = rsrRevenueOverview.erc20s.reduce((acc, erc20, index) => {
        const asset = assets[assetMap[erc20]]
        const rsrTradeAmount = formatUnits(
          rsrRevenueOverview.surpluses[index],
          asset.token.decimals
        )
        const rTokenTradeAmount = formatUnits(
          rTokenRevenueOverview.surpluses[index],
          asset.token.decimals
        )

        if (asset.token.address !== RSR_ADDRESS[chainId]) {
          acc[rsrRevenueOverview.canStart[index] ? 'unshift' : 'push']({
            sell: asset.token,
            buy: assets[assetMap[RSR_ADDRESS[chainId]]].token,
            amount: rsrTradeAmount,
            minAmount: formatUnits(
              rsrRevenueOverview.minTradeAmounts[index],
              asset.token.decimals
            ),
            trader: rsrTrader,
            canStart: rsrRevenueOverview.canStart[index],
            output:
              +rsrTradeAmount /
              (assets[assetMap[RSR_ADDRESS[chainId]]].priceUsd /
                asset.priceUsd),
          })
        }

        if (asset.token.address !== rToken.address) {
          acc[rTokenRevenueOverview.canStart[index] ? 'unshift' : 'push']({
            sell: asset.token,
            buy: assets[assetMap[rToken.address]].token,
            amount: rTokenTradeAmount,
            minAmount: formatUnits(
              rTokenRevenueOverview.minTradeAmounts[index],
              asset.token.decimals
            ),
            trader: rTokenTrader,
            canStart: rTokenRevenueOverview.canStart[index],
            output:
              +rTokenTradeAmount /
              (assets[assetMap[rToken.address]].priceUsd / asset.priceUsd),
          })
        }

        return acc
      }, [] as Auction[])

      let recollaterizationAuction = null

      if (recoAuction.canStart) {
        const sell = assets[assetMap[recoAuction.sell]]
        const buy = assets[assetMap[recoAuction.buy]]
        const amount = formatUnits(recoAuction.sellAmount, sell.token.decimals)

        recollaterizationAuction = {
          sell: sell.token,
          buy: buy.token,
          amount,
          minAmount: '0',
          trader: backingManager,
          canStart: true,
          output: +amount / (buy.priceUsd / sell.priceUsd),
        }
      }

      return { revenue: auctions, recollaterization: recollaterizationAuction }
    }
  )
)

export const accumulatedRevenueAtom = simplifyLoadable(accumulatedRevenue)
export const auctionsOverviewAtom = simplifyLoadable(auctionsOverview)
