import L2OutputOracle from 'abis/L2OutputOracle'
import OptimismPortal from 'abis/OptimismPortal'
import { useEffect, useMemo, useState } from 'react'
import { ChainId } from 'utils/chains'
import { L2_OUTPUT_ORACLE_PROXY_ADDRESS, OP_PORTAL } from '../utils/constants'
import { getWithdrawalMessage } from '../utils/getWithdrawalMessage'
import { hashWithdrawal } from '../utils/hashWithdrawal'
import { WithdrawalPhase } from '../utils/types'
import { useL2OutputProposal } from './useL2OutputProposal'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'

export function useBlockNumberOfLatestL2OutputProposal() {
  const { data: blockNumberOfLatestL2OutputProposal } = useReadContract({
    address: L2_OUTPUT_ORACLE_PROXY_ADDRESS,
    abi: L2OutputOracle,
    functionName: 'latestBlockNumber',
    chainId: ChainId.Mainnet,
  })

  return blockNumberOfLatestL2OutputProposal
}

export function useHasWithdrawalBeenProven(withdrawalHash: string | null) {
  const { data: provenWithdrawal } = useReadContract({
    address: withdrawalHash ? OP_PORTAL : undefined,
    abi: OptimismPortal,
    functionName: 'provenWithdrawals',
    args: withdrawalHash ? [withdrawalHash as `0x${string}`] : undefined,
    chainId: ChainId.Mainnet,
  })
  const withdrawalHasBeenProven = provenWithdrawal?.[1] !== BigInt(0)

  return withdrawalHasBeenProven
}

export function useHasWithdrawalBeenFinalized(withdrawalHash: string | null) {
  const { data: isWithdrawalFinalized } = useReadContract({
    address: withdrawalHash ? OP_PORTAL : undefined,
    abi: OptimismPortal,
    functionName: 'finalizedWithdrawals',
    args: withdrawalHash ? [withdrawalHash as `0x${string}`] : undefined,
    chainId: ChainId.Mainnet,
  })

  return isWithdrawalFinalized
}

export function useProvenWithdrawl(withdrawalHash: string | null) {
  const { data: provenWithdrawal } = useReadContract({
    address: withdrawalHash ? OP_PORTAL : undefined,
    abi: OptimismPortal,
    functionName: 'provenWithdrawals',
    args: withdrawalHash ? [withdrawalHash as `0x${string}`] : undefined,
    chainId: ChainId.Mainnet,
  })

  return provenWithdrawal
}

// reference:
// https://github.com/ethereum-optimism/optimism/blob/2d04a15ebde0baf885b17760f11496cf54efe55f/packages/contracts-bedrock/contracts/L1/OptimismPortal.sol#L504
export function useIsFinalizationPeriodElapsed(timestamp: bigint | undefined) {
  const { data: FINALIZATION_PERIOD_SECONDS } = useReadContract({
    address: L2_OUTPUT_ORACLE_PROXY_ADDRESS,
    abi: L2OutputOracle,
    functionName: 'FINALIZATION_PERIOD_SECONDS',
    chainId: ChainId.Mainnet,
  })

  if (FINALIZATION_PERIOD_SECONDS && timestamp) {
    return {
      hasElapsed:
        Math.floor(Date.now() / 1000) > timestamp + FINALIZATION_PERIOD_SECONDS,
      challengeWindowEndTime: timestamp + FINALIZATION_PERIOD_SECONDS,
    }
  }
  return {
    hasElapsed: false,
    challengeWindowEndTime: BigInt(0),
  }
}

type UseWithdrawalStateProps = {
  initializeTxHash: `0x${string}`
  blockNumberOfLatestL2OutputProposal?: bigint
}
function useWithdrawalStatus({
  initializeTxHash,
  blockNumberOfLatestL2OutputProposal,
}: UseWithdrawalStateProps): {
  status: WithdrawalPhase
  challengeWindowEndTime?: bigint
} {
  const [withdrawalHash, setWithdrawalHash] = useState<string | null>(null)

  const { data: withdrawalReceipt } = useWaitForTransactionReceipt({
    hash: initializeTxHash,
    chainId: ChainId.Base,
  })
  const withdrawalHasBeenProven = useHasWithdrawalBeenProven(withdrawalHash)
  const withdrawalHasBeenFinalized =
    useHasWithdrawalBeenFinalized(withdrawalHash)
  const provenWithdrawal = useProvenWithdrawl(withdrawalHash)
  const {
    hasElapsed: finalizationPeriodHasElapsedForProvenWithdrawal,
    challengeWindowEndTime,
  } = useIsFinalizationPeriodElapsed(provenWithdrawal?.[1])
  const l2OutputProposal = useL2OutputProposal(provenWithdrawal?.[2])
  const finalizationPeriodHasElapsedForL2OutputProposal =
    useIsFinalizationPeriodElapsed(l2OutputProposal?.timestamp)

  const isWithdrawalReadyToProve = useMemo(
    () =>
      blockNumberOfLatestL2OutputProposal && withdrawalReceipt?.blockNumber
        ? blockNumberOfLatestL2OutputProposal >= withdrawalReceipt?.blockNumber
        : false,
    [blockNumberOfLatestL2OutputProposal, withdrawalReceipt]
  )

  useEffect(() => {
    if (withdrawalReceipt) {
      const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt)
      const hashedWithdrawal = hashWithdrawal(withdrawalMessage)
      setWithdrawalHash(hashedWithdrawal)
    }
  }, [withdrawalReceipt])

  let status: WithdrawalPhase = 'PROPOSING_ON_CHAIN'

  if (!isWithdrawalReadyToProve) status = 'PROPOSING_ON_CHAIN'
  if (!withdrawalHasBeenProven && isWithdrawalReadyToProve) status = 'PROVE'
  if (!withdrawalHasBeenFinalized && withdrawalHasBeenProven) {
    status =
      finalizationPeriodHasElapsedForProvenWithdrawal &&
      finalizationPeriodHasElapsedForL2OutputProposal
        ? 'FINALIZE'
        : 'CHALLENGE_WINDOW'
  }

  if (withdrawalHasBeenFinalized) status = 'FUNDS_WITHDRAWN'

  if (status === 'CHALLENGE_WINDOW') {
    return {
      status,
      challengeWindowEndTime,
    }
  }
  return {
    status,
  }
}

export default useWithdrawalStatus
