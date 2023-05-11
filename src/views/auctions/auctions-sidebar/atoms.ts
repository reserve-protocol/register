import { FacadeInterface } from 'abis'
import { Facade } from 'abis/types'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import {
  getValidWeb3Atom,
  rTokenAssetERC20MapAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenContractsAtom,
} from 'state/atoms'
import { getContract } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { simplifyLoadable } from 'utils/atoms/utils'

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
  atom(async (get) => {
    const { provider, chainId } = get(getValidWeb3Atom)
    const { rsrTrader, rTokenTrader, backingManager } = get(rTokenContractsAtom)

    if (!provider || !rsrTrader || !rTokenTrader || !backingManager) {
      return 0
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

    return {}
  })
)

export const accumulatedRevenueAtom = simplifyLoadable(accumulatedRevenue)
