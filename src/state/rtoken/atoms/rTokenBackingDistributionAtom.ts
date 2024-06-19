import FacadeRead from 'abis/FacadeRead'
import { atom } from 'jotai'
import {
  chainIdAtom,
  collateralYieldAtom,
  ethPriceAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { Collateral } from 'types'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { TARGET_UNITS } from 'utils/constants'
import { Address, formatEther, hexToString } from 'viem'
import { readContracts } from 'wagmi/actions'
import rTokenAtom from './rTokenAtom'

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

  const [
    [erc20s, uoaShares, targets],
    [backing, overCollateralization],
    [_, __, targetAmts],
  ] = await readContracts({
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
      {
        ...callParams,
        functionName: 'primeBasket',
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
          targetAmts: formatEther(targetAmts[index] * 100n),
          targetUnit: hexToString(targets[index], { size: 32 }),
        },
      }),
      {} as {
        [x: Address]: { share: number; targetAmts: string; targetUnit: string }
      }
    ),
  }
})

export interface CollateralDetail extends Collateral {
  yield: number
  valueTarget?: number // Only for ETH/BTC
  valueSingleTarget?: number // Only for ETH/BTC
  valueUsd: number
  valueSingleUsd: number
  distribution: number
  distributionRaw: string
  targetUnit: string
  displayName: string
}

// Derived atom with detailed RToken basket breakdown used on multiple views
export const rTokenCollateralDetailedAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const supply = get(rTokenStateAtom)?.tokenSupply
  const price = get(rTokenPriceAtom)
  const ethPrice = get(ethPriceAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution
  const collateralYields = get(collateralYieldAtom)

  if (
    !rToken ||
    !distribution ||
    supply === undefined ||
    !price ||
    !Object.keys(collateralYields).length
  ) {
    return null
  }

  // TODO: ETH/BTC distribution? no tokens peg to BTC yet
  const supplyUsd = supply ? supply * price : 0

  return rToken.collaterals.map((collateral) => {
    const data: CollateralDetail = {
      ...collateral,
      yield:
        collateralYields[rToken.chainId]?.[collateral.symbol.toLowerCase()] ||
        0,
      valueUsd: supplyUsd
        ? (supplyUsd * distribution[collateral.address].share) / 100
        : 0,
      valueSingleUsd: (price * distribution[collateral.address].share) / 100,
      distribution: distribution[collateral.address].share,
      distributionRaw: distribution[collateral.address].targetAmts,
      targetUnit: distribution[collateral.address].targetUnit,
      displayName: collateral.displayName ?? collateral.name,
    }

    // TODO: Only ETH case is supported rn, BTC/EUR future problem!
    if (data.targetUnit === TARGET_UNITS.ETH) {
      data.valueTarget = data.valueUsd ? data.valueUsd / ethPrice : 0
      data.valueSingleTarget = data.valueSingleUsd / ethPrice
    }

    return data
  }) as CollateralDetail[]
})

export default rTokenBackingDistributionAtom
