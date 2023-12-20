import L2OutputOracle from 'abis/L2OutputOracle'
import { ChainId } from 'utils/chains'
import { useContractRead } from 'wagmi'
import { L2_OUTPUT_ORACLE_PROXY_ADDRESS } from '../utils/constants'

export function useWithdrawalL2OutputIndex(blockNumber?: bigint) {
  const { data: withdrawalL2OutputIndex } = useContractRead({
    address: blockNumber ? L2_OUTPUT_ORACLE_PROXY_ADDRESS : undefined,
    abi: L2OutputOracle,
    functionName: 'getL2OutputIndexAfter',
    args: blockNumber ? [blockNumber] : undefined,
    chainId: ChainId.Mainnet,
  })

  return withdrawalL2OutputIndex
}
