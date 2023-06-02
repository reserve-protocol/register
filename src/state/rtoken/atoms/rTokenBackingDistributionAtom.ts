import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenAtom from './rTokenAtom'
import { getValidWeb3Atom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { FacadeInterface } from 'abis'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { formatEther } from 'ethers/lib/utils'
import { truncateDecimals } from 'utils'
import { ethers } from 'ethers'

const rTokenBackingDistributionAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const { provider, chainId } = get(getValidWeb3Atom)

  if (!rToken?.main || !provider) {
    return null
  }

  const callParams = {
    abi: FacadeInterface,
    address: FACADE_ADDRESS[chainId ?? 1],
    args: [rToken.address],
  }

  const [{ erc20s, uoaShares, targets }, { backing, overCollateralization }] =
    await promiseMulticall(
      [
        {
          ...callParams,
          method: 'basketBreakdown',
        },
        {
          ...callParams,
          method: 'backingOverview',
        },
      ],
      provider
    )

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
