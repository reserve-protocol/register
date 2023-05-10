import { FacadeInterface } from 'abis'
import { Facade } from 'abis/types'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { getValidWeb3Atom, rTokenAtom, rTokenContractsAtom } from 'state/atoms'
import { getContract } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { simplifyLoadable } from 'utils/atoms/utils'

const accumulatedRevenue = loadable(
  atom(async (get) => {
    const { provider, chainId } = get(getValidWeb3Atom)
    const rToken = get(rTokenAtom)

    if (!provider || !rToken) {
      return 0
    }

    const contract = getContract(
      FACADE_ADDRESS[chainId],
      FacadeInterface,
      provider
    ) as Facade

    const result = await contract.callStatic.balancesAcrossAllTraders(
      rToken.address
    )

    return {}
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
