import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useDtfSdk, type SupportedChainId } from '@reserve-protocol/react-sdk'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { isAddressEqual, type Address, type Hex } from 'viem'

export type ProposalTypeGovernance = {
  isOptimistic?: boolean | null
  optimistic?: {
    selectorRegistry?: Address
    proposers?: readonly Address[]
  }
}

type UseProposalTypeEligibilityParams = {
  governance?: ProposalTypeGovernance | null
  targets?: readonly Address[]
  calldatas?: readonly Hex[]
}

const getCalldataSelector = (calldata: Hex) => {
  if (calldata.length < 10) return undefined

  return calldata.slice(0, 10) as Hex
}

export const useProposalTypeEligibility = ({
  governance,
  targets,
  calldatas,
}: UseProposalTypeEligibilityParams) => {
  const sdk = useDtfSdk()
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const selectorRegistry = governance?.optimistic?.selectorRegistry
  const optimisticProposers = governance?.optimistic?.proposers ?? []
  const isOptimisticProposer =
    !!wallet &&
    optimisticProposers.some((proposer) => isAddressEqual(proposer, wallet))
  const canCheckSelectors =
    !!governance?.isOptimistic &&
    !!selectorRegistry &&
    !!targets?.length &&
    !!calldatas?.length &&
    targets.length === calldatas.length &&
    isOptimisticProposer

  const selectorChecks = useMemo(() => {
    if (!canCheckSelectors || !selectorRegistry || !targets || !calldatas) {
      return []
    }

    const checks: { registry: Address; target: Address; selector: Hex }[] = []

    for (let index = 0; index < calldatas.length; index++) {
      const selector = getCalldataSelector(calldatas[index])
      const target = targets[index]

      if (!selector || !target) return []

      checks.push({
        registry: selectorRegistry,
        target,
        selector,
      })
    }

    return checks
  }, [calldatas, canCheckSelectors, selectorRegistry, targets])

  const selectorQueries = useQueries({
    queries: selectorChecks.map((check) => ({
      queryKey: [
        'index-dtf-selector-registry-is-allowed',
        chainId,
        check.registry,
        check.target,
        check.selector,
      ],
      queryFn: () =>
        sdk.index.getSelectorRegistryIsAllowed({
          chainId: chainId as SupportedChainId,
          ...check,
      }),
    })),
  })
  const hasSelectorError =
    selectorChecks.length > 0 && selectorQueries.some((query) => query.isError)
  const isChecking =
    selectorChecks.length > 0 &&
    selectorQueries.some(
      (query) => query.data === undefined && (query.isLoading || query.isFetching)
    )
  const isOptimisticEligible =
    selectorChecks.length > 0 &&
    !hasSelectorError &&
    selectorQueries.length === selectorChecks.length &&
    selectorQueries.every((query) => query.data === true)

  return {
    hasSelectorError,
    isChecking,
    isOptimisticEligible,
  }
}
