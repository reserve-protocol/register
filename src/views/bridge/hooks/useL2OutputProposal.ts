import L2OutputOracle from 'abis/L2OutputOracle'
import { ChainId } from 'utils/chains'
import { useReadContract } from 'wagmi'
import { L2_OUTPUT_ORACLE_PROXY_ADDRESS } from '../utils/constants'

export function useL2OutputProposal(withdrawalL2OutputIndex?: bigint) {
  const { data: l2OutputProposal } = useReadContract({
    address: withdrawalL2OutputIndex
      ? L2_OUTPUT_ORACLE_PROXY_ADDRESS
      : undefined,
    abi: L2OutputOracle,
    functionName: 'getL2Output',
    args: withdrawalL2OutputIndex ? [withdrawalL2OutputIndex] : undefined,
    chainId: ChainId.Mainnet,
  })

  return l2OutputProposal
}
