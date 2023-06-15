import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenAtom from './rTokenAtom'
import { chainIdAtom, getValidWeb3Atom, multicallAtom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { FacadeInterface } from 'abis'
import { formatEther } from 'ethers/lib/utils'
import { truncateDecimals } from 'utils'
import { ethers } from 'ethers'
import { useAtomValue } from 'jotai'

const rTokenBackingDistributionAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const chainId = get(chainIdAtom)
  const multicall = get(multicallAtom)

  if (!rToken?.main || !multicall) {
    return null
  }

  const callParams = {
    abi: FacadeInterface,
    address: FACADE_ADDRESS[chainId],
    args: [rToken.address],
  }

  const [{ erc20s, uoaShares, targets }, { backing, overCollateralization }] =
    await multicall([
      {
        ...callParams,
        method: 'basketBreakdown',
      },
      {
        ...callParams,
        method: 'backingOverview',
      },
    ])

  return {
    backing: Math.min(100, Math.ceil(Number(formatEther(backing)) * 100)),
    staked: Math.ceil(Number(formatEther(overCollateralization)) * 100),
    collateralDistribution: erc20s.reduce(
      (acc: any, current: any, index: any) => ({
        ...acc,
        [current]: {
          share: truncateDecimals(+formatEther(uoaShares[index]) * 100, 4),
          targetUnit: ethers.utils
            .parseBytes32String(targets[index])
            .toUpperCase(),
        },
      }),
      {}
    ),
  }
})

export default rTokenBackingDistributionAtom
