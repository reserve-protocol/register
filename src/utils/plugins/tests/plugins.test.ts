import { describe, expect, it } from 'vitest'
import { ChainId } from 'utils/chains'
import collateralPlugins, { getPluginByErc20 } from '../index'

describe('collateral plugin catalog', () => {
  it('keeps symbols unique per chain because register keys metadata by symbol', () => {
    for (const [chainId, plugins] of Object.entries(collateralPlugins)) {
      const symbols = plugins.map((p) => p.symbol.toLowerCase())
      const duplicates = symbols.filter((s, i) => symbols.indexOf(s) !== i)
      expect(duplicates, `chain ${chainId}`).toEqual([])
    }
  })

  it('resolves a plugin by erc20 regardless of address casing', () => {
    const v1 = getPluginByErc20(
      ChainId.Mainnet,
      '0xbeef01735c132ada46aa9aa4c54623caa92a64cb'
    )
    const v2 = getPluginByErc20(
      ChainId.Mainnet,
      '0xBEEF088055857739C12CD3765F20B7679DEF0F51'
    )

    expect(v1?.symbol).toBe('steakUSDC')
    expect(v2?.symbol).toBe('steakUSDCPrime')
    expect(v2?.protocol).toBe('MORPHOV2')
    expect(getPluginByErc20(ChainId.Mainnet, '0x0000000000000000000000000000000000000001')).toBeUndefined()
  })
})
