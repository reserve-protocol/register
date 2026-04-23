import reserveOptimisticGovernorAbi, {
  CANCELLER_ROLE,
  OPTIMISTIC_PROPOSER_ROLE,
  optimisticSelectorRegistryAbi,
  optimisticTimelockAbi,
} from '@/abis/reserve-optimistic-governor'
import type { IndexDTF, IndexDTFGovernance } from '@/types'
import { getDTFSettingsGovernance } from '@/views/index-dtf/governance/governance-helpers'
import { useMemo } from 'react'
import { Address, Hex } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

const KNOWN_OPTIMISTIC_SELECTORS: Record<
  Hex,
  { functionName: string; signature: string }
> = {
  '0x207c8eed': {
    functionName: 'startRebalance(...)',
    signature:
      'startRebalance((address,(uint256,uint256,uint256),(uint256,uint256),uint256,bool)[],(uint256,uint256,uint256),uint256,uint256)',
  },
}

const toNumber = (value: bigint | number | undefined) =>
  value === undefined ? undefined : Number(value)

const getSelectorMetadata = (selector: Hex) => {
  const normalizedSelector = selector.toLowerCase() as Hex
  return (
    KNOWN_OPTIMISTIC_SELECTORS[normalizedSelector] ?? {
      functionName: normalizedSelector,
      signature: normalizedSelector,
    }
  )
}

type SelectorAllowlistItem = {
  target: Address
  selector: Hex
  functionName: string
  signature: string
}

const useOptimisticGovernance = (
  dtf?: IndexDTF,
  governanceOverride?: IndexDTFGovernance
) => {
  const governance = governanceOverride ?? getDTFSettingsGovernance(dtf)
  const governorAddress = governance?.id
  const chainId = dtf?.chainId

  const { data: governorData } = useReadContracts({
    contracts: governorAddress
      ? [
          {
            address: governorAddress,
            abi: reserveOptimisticGovernorAbi,
            functionName: 'optimisticParams',
            chainId,
          },
          {
            address: governorAddress,
            abi: reserveOptimisticGovernorAbi,
            functionName: 'proposalThrottleCapacity',
            chainId,
          },
          {
            address: governorAddress,
            abi: reserveOptimisticGovernorAbi,
            functionName: 'selectorRegistry',
            chainId,
          },
          {
            address: governorAddress,
            abi: reserveOptimisticGovernorAbi,
            functionName: 'timelock',
            chainId,
          },
        ]
      : [],
    allowFailure: true,
    query: {
      enabled: !!governorAddress,
    },
  })

  const isOptimisticGovernance = governorData?.[0]?.status === 'success'

  const optimisticParams = useMemo(() => {
    if (!isOptimisticGovernance) return undefined

    const [vetoDelay, vetoPeriod, vetoThreshold] = governorData[0].result as [
      bigint | number,
      bigint | number,
      bigint,
    ]

    return {
      vetoDelay: Number(vetoDelay),
      vetoPeriod: Number(vetoPeriod),
      vetoThreshold,
    }
  }, [governorData, isOptimisticGovernance])

  const proposalThrottleCapacity = useMemo(() => {
    if (governorData?.[1]?.status !== 'success') return undefined
    return toNumber(governorData[1].result as bigint | number)
  }, [governorData])

  const selectorRegistry = useMemo(() => {
    if (governorData?.[2]?.status !== 'success') return undefined
    return governorData[2].result as Address
  }, [governorData])

  const timelock = useMemo(() => {
    if (governorData?.[3]?.status !== 'success') return undefined
    return governorData[3].result as Address
  }, [governorData])

  const { data: selectorTargets } = useReadContract({
    address: selectorRegistry,
    abi: optimisticSelectorRegistryAbi,
    functionName: 'targets',
    chainId,
    query: {
      enabled: !!selectorRegistry,
    },
  })

  const { data: selectorResults } = useReadContracts({
    contracts: (selectorTargets ?? []).map((target) => ({
      address: selectorRegistry as Address,
      abi: optimisticSelectorRegistryAbi,
      functionName: 'selectorsAllowed' as const,
      args: [target],
      chainId,
    })),
    allowFailure: true,
    query: {
      enabled: !!selectorRegistry && (selectorTargets?.length ?? 0) > 0,
    },
  })

  const selectorAllowlist = useMemo(() => {
    if (!selectorTargets?.length || !selectorResults?.length) return []

    return selectorTargets.flatMap((target, index) => {
      const result = selectorResults[index]

      if (result?.status !== 'success') return []

      return (result.result as Hex[]).map((selector) => ({
        target,
        selector,
        ...getSelectorMetadata(selector),
      }))
    }) as SelectorAllowlistItem[]
  }, [selectorResults, selectorTargets])

  const { data: timelockRoleCounts } = useReadContracts({
    contracts: timelock
      ? [
          {
            address: timelock,
            abi: optimisticTimelockAbi,
            functionName: 'getRoleMemberCount',
            args: [OPTIMISTIC_PROPOSER_ROLE],
            chainId,
          },
          {
            address: timelock,
            abi: optimisticTimelockAbi,
            functionName: 'getRoleMemberCount',
            args: [CANCELLER_ROLE],
            chainId,
          },
        ]
      : [],
    allowFailure: true,
    query: {
      enabled: !!timelock,
    },
  })

  const optimisticProposerCount = useMemo(() => {
    if (timelockRoleCounts?.[0]?.status !== 'success') return 0
    return toNumber(timelockRoleCounts[0].result as bigint | number) ?? 0
  }, [timelockRoleCounts])

  const cancellerCount = useMemo(() => {
    if (timelockRoleCounts?.[1]?.status !== 'success') return 0
    return toNumber(timelockRoleCounts[1].result as bigint | number) ?? 0
  }, [timelockRoleCounts])

  const { data: optimisticProposerResults } = useReadContracts({
    contracts:
      timelock && optimisticProposerCount > 0
        ? Array.from({ length: optimisticProposerCount }, (_, index) => ({
            address: timelock,
            abi: optimisticTimelockAbi,
            functionName: 'getRoleMember' as const,
            args: [OPTIMISTIC_PROPOSER_ROLE, BigInt(index)],
            chainId,
          }))
        : [],
    allowFailure: true,
    query: {
      enabled: !!timelock && optimisticProposerCount > 0,
    },
  })

  const { data: cancellerResults } = useReadContracts({
    contracts:
      timelock && cancellerCount > 0
        ? Array.from({ length: cancellerCount }, (_, index) => ({
            address: timelock,
            abi: optimisticTimelockAbi,
            functionName: 'getRoleMember' as const,
            args: [CANCELLER_ROLE, BigInt(index)],
            chainId,
          }))
        : [],
    allowFailure: true,
    query: {
      enabled: !!timelock && cancellerCount > 0,
    },
  })

  const optimisticProposers = useMemo(() => {
    return (optimisticProposerResults ?? []).flatMap((result) =>
      result.status === 'success' ? [result.result as Address] : []
    )
  }, [optimisticProposerResults])

  const cancellers = useMemo(() => {
    return (cancellerResults ?? []).flatMap((result) =>
      result.status === 'success' ? [result.result as Address] : []
    )
  }, [cancellerResults])

  return {
    isOptimisticGovernance,
    optimisticParams,
    proposalThrottleCapacity,
    selectorRegistry,
    selectorAllowlist,
    optimisticProposers,
    cancellers,
  }
}

export default useOptimisticGovernance
