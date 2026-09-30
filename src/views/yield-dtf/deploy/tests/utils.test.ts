import { describe, expect, it } from 'vitest'
import { ChainId } from 'utils/chains'
import { getPluginByErc20 } from 'utils/plugins'
import { Collateral } from 'components/rtoken-setup/atoms'
import { getDeployParameters } from '../utils'

const tokenConfig = {
  name: 'Test',
  ticker: 'TEST',
  mandate: 'test',
  reweightable: false,
  enableIssuancePremium: false,
  tradingDelay: '0',
  batchAuctionLength: '900',
  dutchAuctionLength: '1800',
  backingBuffer: '0.1',
  maxTradeSlippage: '0.5',
  issuanceThrottleAmount: '2000000',
  issuanceThrottleRate: '10',
  redemptionThrottleAmount: '2500000',
  redemptionThrottleRate: '12.5',
  rewardRatio: '0.0000011460766875',
  unstakingDelay: '1209600',
  minTrade: '1000',
  maxTrade: '1000000',
  shortFreeze: '259200',
  longFreeze: '604800',
  withdrawalLeak: '5',
  warmupPeriod: '900',
}

const revenueSplit = { holders: '60', stakers: '40', external: [] }

const plugin = (erc20: string): Collateral => {
  const p = getPluginByErc20(ChainId.Mainnet, erc20)!
  return {
    symbol: p.symbol,
    address: p.address,
    targetName: p.targetName,
    rewardTokens: p.rewardTokens,
    erc20: p.erc20,
  }
}

const USDT = plugin('0xdAC17F958D2ee523a2206206994597C13D831ec7')
const SKY_USDT_SAVINGS = plugin('0x23f5E9c35820f4baB695Ac1F19c203cC3f8e1e11')
const SENTORA_PYUSD = plugin('0xb576765fB15505433aF24FEe2c0325895C559FB2')
const PYUSD_PLUGIN = '0x9A65173df5D5B86E26300Cc9cA5Ff378be6DAeA5'

const deployAssets = (primary: Collateral[], backup: Collateral[] = []) => {
  const result = getDeployParameters(
    tokenConfig,
    {
      USD: {
        scale: '1',
        collaterals: primary,
        distribution: primary.map(() => (100 / primary.length).toString()),
      },
    },
    backup.length ? { USD: { diversityFactor: 1, collaterals: backup } } : {},
    revenueSplit,
    ChainId.Mainnet
  )
  expect(result).toBeDefined()
  return result![1].assets
}

describe('getDeployParameters reward assets', () => {
  it('registers the reward asset of a rewarding Morpho vault', () => {
    expect(deployAssets([SENTORA_PYUSD])).toEqual([PYUSD_PLUGIN])
  })

  it('does not pre-register a reward that is also primary collateral (FacadeWrite would revert "duplicate collateral")', () => {
    expect(deployAssets([USDT, SKY_USDT_SAVINGS])).toEqual([])
  })

  it('does not pre-register a reward that is emergency collateral', () => {
    expect(deployAssets([SKY_USDT_SAVINGS], [USDT])).toEqual([])
  })
})
