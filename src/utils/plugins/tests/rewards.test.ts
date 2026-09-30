import { describe, expect, it } from 'vitest'
import { ChainId } from 'utils/chains'
import { getPluginByErc20, getRewardAssetsToRegister } from '../index'

const USDT_ERC20 = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const PYUSD_ERC20 = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
const USDT_PLUGIN = '0xd717d722074C8dBfd0a29F73E4638cCc49C7D53D'
const PYUSD_PLUGIN = '0x9A65173df5D5B86E26300Cc9cA5Ff378be6DAeA5'
const SKY_USDT_VAULT = '0x23f5E9c35820f4baB695Ac1F19c203cC3f8e1e11'
const SENTORA_PYUSD_VAULT = '0xb576765fB15505433aF24FEe2c0325895C559FB2'
const COMP_ASSET = '0x63eDdF26Bc65eDa1D1c0147ce8E23c09BE963596'
const OLD_USDT_PLUGIN = '0x1111111111111111111111111111111111111111'

const skyUsdt = getPluginByErc20(ChainId.Mainnet, SKY_USDT_VAULT)!
const sentoraPyusd = getPluginByErc20(ChainId.Mainnet, SENTORA_PYUSD_VAULT)!

describe('Morpho Vault V2 reward mapping', () => {
  it('points each rewarding vault at the listed plugin of its reward token', () => {
    expect(skyUsdt.rewardTokens).toEqual([USDT_PLUGIN])
    expect(sentoraPyusd.rewardTokens).toEqual([PYUSD_PLUGIN])
    expect(getPluginByErc20(ChainId.Mainnet, USDT_ERC20)?.address).toBe(
      USDT_PLUGIN
    )
    expect(getPluginByErc20(ChainId.Mainnet, PYUSD_ERC20)?.address).toBe(
      PYUSD_PLUGIN
    )
  })
})

describe('getRewardAssetsToRegister', () => {
  it('registers the reward assets of new collaterals', () => {
    expect(
      getRewardAssetsToRegister(ChainId.Mainnet, [skyUsdt, sentoraPyusd], [])
    ).toEqual([USDT_PLUGIN, PYUSD_PLUGIN])
  })

  it('skips a reward whose token is already registered with another plugin', () => {
    expect(
      getRewardAssetsToRegister(
        ChainId.Mainnet,
        [skyUsdt],
        [OLD_USDT_PLUGIN, USDT_ERC20]
      )
    ).toEqual([])
  })

  it('skips a reward that is the same plugin used as collateral', () => {
    expect(
      getRewardAssetsToRegister(ChainId.Mainnet, [skyUsdt], [USDT_PLUGIN])
    ).toEqual([])
  })

  it('compares addresses case-insensitively', () => {
    expect(
      getRewardAssetsToRegister(
        ChainId.Mainnet,
        [skyUsdt],
        [USDT_ERC20.toLowerCase()]
      )
    ).toEqual([])
  })

  it('registers a shared reward once', () => {
    expect(
      getRewardAssetsToRegister(
        ChainId.Mainnet,
        [skyUsdt, { rewardTokens: [USDT_PLUGIN.toLowerCase()] }],
        []
      )
    ).toEqual([USDT_PLUGIN])
  })

  it('keeps rewards outside the catalog, deduped by address', () => {
    expect(
      getRewardAssetsToRegister(
        ChainId.Mainnet,
        [{ rewardTokens: [COMP_ASSET] }, { rewardTokens: [COMP_ASSET] }],
        []
      )
    ).toEqual([COMP_ASSET])
  })

  it('ignores empty and zero-address rewards', () => {
    expect(
      getRewardAssetsToRegister(
        ChainId.Mainnet,
        [
          {},
          { rewardTokens: ['0x0000000000000000000000000000000000000000'] },
        ],
        []
      )
    ).toEqual([])
  })
})
