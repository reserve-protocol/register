import {
  revenueSplitAtom,
  ExternalAddressSplit,
} from 'components/rtoken-setup/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenRevenueSplitAtom } from 'state/atoms'

const parseExternalMap = (externals: ExternalAddressSplit[]) => {
  return externals.reduce((prev, curr) => {
    prev[curr.address] = curr
    return prev
  }, <{ [x: string]: ExternalAddressSplit }>{})
}

export interface DistributionChange {
  key: string
  current: string
  proposed: string
  isExternal: boolean
  isTotal: boolean
}

export interface ExternalChange {
  split: ExternalAddressSplit
  isNew: boolean
}

export interface RevenueSplitChanges {
  externals: ExternalChange[]
  distributions: DistributionChange[]
  count: number
}

const useRevenueSplitChanges = () => {
  const proposedRevenueSplit = useAtomValue(revenueSplitAtom)
  const currentRevenueSplit = useAtomValue(rTokenRevenueSplitAtom)

  return useMemo(() => {
    const changes: RevenueSplitChanges = {
      externals: [],
      distributions: [],
      count: 0,
    }

    if (!currentRevenueSplit) {
      return changes
    }

    if (
      (proposedRevenueSplit.holders || '0') !==
      (currentRevenueSplit.holders || '0')
    ) {
      changes.count += 1
      changes.distributions.push({
        key: 'holders',
        current: currentRevenueSplit.holders,
        proposed: proposedRevenueSplit.holders,
        isExternal: false,
        isTotal: true,
      })
    }

    if (
      (proposedRevenueSplit.stakers || '0') !==
      (currentRevenueSplit.stakers || '0')
    ) {
      changes.count += 1
      changes.distributions.push({
        key: 'stakers',
        current: currentRevenueSplit.stakers,
        proposed: proposedRevenueSplit.stakers,
        isExternal: false,
        isTotal: true,
      })
    }

    const proposedExternalMap = parseExternalMap(proposedRevenueSplit.external)
    const currentExternalMap = parseExternalMap(currentRevenueSplit.external)
    const addresses = Array.from(
      new Set([
        ...Object.keys(proposedExternalMap),
        ...Object.keys(currentExternalMap),
      ])
    )

    for (const externalAddress of addresses) {
      if (!externalAddress) {
        continue
      }

      const proposedSplit = proposedExternalMap[externalAddress]
      const currentSplit = currentExternalMap[externalAddress]

      if (!proposedSplit || !currentSplit) {
        changes.count += 1
        changes.externals.push({
          split: proposedSplit || currentSplit,
          isNew: !!proposedSplit,
        })
      } else {
        // Check total allocation
        if (proposedSplit.total !== currentSplit.total) {
          changes.count += 1
          changes.distributions.push({
            key: externalAddress,
            current: currentSplit.total,
            proposed: proposedSplit.total,
            isExternal: true,
            isTotal: true,
          })
        }
        // Check RToken/RSR Allocation
        if (
          proposedSplit.holders !== currentSplit.holders ||
          proposedSplit.stakers !== currentSplit.stakers
        ) {
          changes.count += 1
          changes.distributions.push({
            key: externalAddress,
            current: `${currentSplit.holders}/${currentSplit.stakers}`,
            proposed: `${proposedSplit.holders}/${proposedSplit.stakers}`,
            isExternal: true,
            isTotal: false,
          })
        }
      }
    }

    return changes
  }, [proposedRevenueSplit])
}

export default useRevenueSplitChanges
