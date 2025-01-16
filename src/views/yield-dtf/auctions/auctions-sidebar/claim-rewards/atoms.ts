import { atom } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Trader } from 'types'
import { TRADERS } from 'utils/constants'
import { rewardsByProtocol } from 'utils/plugins'
import { auctionsOverviewAtom } from '@/views/yield-dtf/auctions/atoms'
import { TraderEmissions } from './types'

export const traderRewardsAtom = atom((get) => {
  const data = get(auctionsOverviewAtom)
  const rToken = get(rTokenAtom)
  const traderRewards: Record<Trader, TraderEmissions> = {
    rsrTrader: { total: 0, tokens: [] },
    rTokenTrader: { total: 0, tokens: [] },
    backingManager: { total: 0, tokens: [] },
  }

  if (!data || !rToken) {
    return traderRewards
  }

  for (const erc20 of data.claimableEmissions) {
    const relatedProtocols = rewardsByProtocol[erc20.asset.token.address]

    const relatedCollaterals = rToken.collaterals
      .filter((collateral) => relatedProtocols.includes(collateral.protocol))
      .map((c) => c.address)

    for (const trader of TRADERS) {
      traderRewards[trader].total += erc20[trader] * erc20.asset.priceUsd
      traderRewards[trader].tokens.push({
        symbol: erc20.asset.token.symbol,
        address: erc20.asset.token.address,
        amount: erc20[trader] * erc20.asset.priceUsd,
        collaterals: relatedCollaterals,
      })
    }
  }

  return traderRewards
})
