import { atom } from 'jotai'
import { Trader } from 'types'
import { TRADERS } from 'utils/constants'
import { auctionsOverviewAtom } from 'views/auctions/atoms'
import { TraderEmissions } from './types'

export const traderRewardsAtom = atom((get) => {
  const data = get(auctionsOverviewAtom)
  const traderRewards: Record<Trader, TraderEmissions> = {
    rsrTrader: { total: 0, tokens: [] },
    rTokenTrader: { total: 0, tokens: [] },
    backingManager: { total: 0, tokens: [] },
  }

  if (!data) {
    return traderRewards
  }

  for (const erc20 of data.claimableEmissions) {
    for (const trader of TRADERS) {
      traderRewards[trader].total += erc20[trader] * erc20.asset.priceUsd
      traderRewards[trader].tokens.push({
        symbol: erc20.asset.token.symbol,
        address: erc20.asset.address,
        amount: erc20[trader] * erc20.asset.priceUsd,
      })
    }
  }

  return traderRewards
})
