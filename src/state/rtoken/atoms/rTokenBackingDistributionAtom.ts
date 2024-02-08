import FacadeRead from 'abis/FacadeRead'
import {
  chainIdAtom,
  collateralYieldAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, formatEther, hexToString } from 'viem'
import { readContracts } from 'wagmi/actions'
import rTokenAtom from './rTokenAtom'
import { atom } from 'jotai'
import { Collateral, Token } from 'types'

const rTokenBackingDistributionAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const chainId = get(chainIdAtom)

  if (!rToken?.main) {
    return null
  }

  const callParams = {
    abi: FacadeRead,
    address: FACADE_ADDRESS[chainId],
    args: [rToken.address] as [Address],
  }

  const [[erc20s, uoaShares, targets], [backing, overCollateralization]] =
    await readContracts({
      contracts: [
        {
          ...callParams,
          functionName: 'basketBreakdown',
          chainId,
        },
        {
          ...callParams,
          functionName: 'backingOverview',
          chainId,
        },
      ],
      allowFailure: false,
    })

  return {
    backing: Math.min(100, Math.ceil(Number(formatEther(backing)) * 100)),
    staked: Math.ceil(Number(formatEther(overCollateralization)) * 100),
    collateralDistribution: erc20s.reduce(
      (acc, current, index) => ({
        ...acc,
        [current]: {
          share: truncateDecimals(+formatEther(uoaShares[index]) * 100, 4),
          targetUnit: hexToString(targets[index], { size: 32 }),
        },
      }),
      {} as { [x: Address]: { share: number; targetUnit: string } }
    ),
  }
})

export interface CollateralDetail extends Collateral {
  yield: number
  value: number
  valueSingle: number
  distribution: number
  targetUnit: string
}

// Derived atom with detailed RToken basket breakdown used on multiple views
export const rTokenCollateralDetailedAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const supply = get(rTokenStateAtom)?.tokenSupply
  const price = get(rTokenPriceAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution
  const yields = get(collateralYieldAtom)

  if (
    !rToken ||
    !distribution ||
    !supply ||
    !price ||
    !Object.keys(yields).length
  ) {
    return null
  }

  // TODO: ETH/BTC distribution? no tokens peg to BTC yet
  const supplyUsd = supply ? supply * price : 0

  // const valueCalc = backingType === 'total' ? (supply ? supply * price : 0) : 1

  return rToken.collaterals.map((collateral) => {
    return {
      ...collateral,
      yield: yields[collateral.symbol.toLowerCase()] || 0,
      // value: (valueCalc * distribution[collateral.address].share) / 100,
      value: supplyUsd
        ? (supplyUsd * distribution[collateral.address].share) / 100
        : 0,
      valueSingle: (price * distribution[collateral.address].share) / 100,
      distribution: distribution[collateral.address].share,
      targetUnit: distribution[collateral.address].targetUnit,
    }
  }) as CollateralDetail[]
})

export default rTokenBackingDistributionAtom
