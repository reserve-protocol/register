import FacadeRead from 'abis/FacadeRead'
import { chainIdAtom } from 'state/atoms'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
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
    address: FACADE_ADDRESS[chainId] as Address,
    args: [rToken.address] as [Address],
  }

  const [[erc20s, uoaShares, targets], [backing, overCollateralization]] =
    await readContracts({
      contracts: [
        {
          ...callParams,
          functionName: 'basketBreakdown',
        },
        {
          ...callParams,
          functionName: 'backingOverview',
        },
      ],
      allowFailure: false,
    })

  return {
    backing: Math.min(100, Math.ceil(Number(formatEther(backing)) * 100)),
    staked: Math.ceil(Number(formatEther(overCollateralization)) * 100),
    collateralDistribution: erc20s.reduce(
      (acc: any, current: any, index: any) => ({
        ...acc,
        [current]: {
          share: truncateDecimals(+formatEther(uoaShares[index]) * 100, 4),
          targetUnit: hexToString(targets[index], { size: 32 }),
        },
      }),
      {}
    ),
  }
})

export default rTokenBackingDistributionAtom
