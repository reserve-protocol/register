import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { gqlClientAtom } from 'state/atoms'
import { gql } from 'graphql-request'
import useRToken from 'hooks/useRToken'
import {
  Distribution,
  ensureValidDistribution,
  formatDistribution,
} from 'state/rtoken/atoms/rTokenRevenueSplitAtom'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'
import { ProposalCall } from '@/views/yield-dtf/governance/atoms'

interface SubgraphDistribution {
  destination: string
  rTokenDist: string
  rsrDist: string
}

// WHY: Block_height is a subgraph input object, not a scalar.
// Passing it as a variable with type Block_height lets us do time-travel queries.
const DISTRIBUTION_QUERY = gql`
  query getRTokenDistribution($id: String!, $block: Block_height) {
    rtoken(id: $id, block: $block) {
      revenueDistribution {
        destination
        rTokenDist
        rsrDist
      }
    }
  }
`

const parseDistributions = (raw: SubgraphDistribution[]): Distribution[] =>
  raw.map((d) => ({
    destination: d.destination,
    rTokenDist: Number(d.rTokenDist),
    rsrDist: Number(d.rsrDist),
  }))

// WHY: viem decodes setDistribution(address, (uint16,uint16)) as
// [dest, { rTokenDist, rsrDist }] — the tuple becomes an object
const parseSetDistribution = (
  call: ProposalCall
): Distribution | undefined => {
  const [dest, share] = call.data
  if (!dest || !share) return undefined
  return {
    destination: dest.toString(),
    rTokenDist: Number(share.rTokenDist),
    rsrDist: Number(share.rsrDist),
  }
}

// WHY: viem decodes setDistributions(address[], (uint16,uint16)[]) as
// [dests[], [{ rTokenDist, rsrDist }, ...]]
const parseSetDistributions = (call: ProposalCall): Distribution[] => {
  const [dests, shares] = call.data
  if (!Array.isArray(dests) || !Array.isArray(shares)) return []
  return dests.map((dest: string, i: number) => ({
    destination: dest.toString(),
    rTokenDist: Number(shares[i].rTokenDist),
    rsrDist: Number(shares[i].rsrDist),
  }))
}

// WHY: Subgraph returns lowercase addresses, viem calldata returns checksummed.
// Normalize all Map keys to lowercase so they match correctly.
const applyDistributionChanges = (
  current: Distribution[],
  calls: ProposalCall[]
): Distribution[] => {
  const map = new Map<string, Distribution>()
  for (const d of current) {
    map.set(d.destination.toLowerCase(), { ...d })
  }

  for (const call of calls) {
    let changes: Distribution[] = []
    if (call.signature === 'setDistribution') {
      const parsed = parseSetDistribution(call)
      if (parsed) changes = [parsed]
    } else if (call.signature === 'setDistributions') {
      changes = parseSetDistributions(call)
    }

    for (const change of changes) {
      const key = change.destination.toLowerCase()
      if (change.rTokenDist === 0 && change.rsrDist === 0) {
        map.delete(key)
      } else {
        map.set(key, { ...change, destination: key })
      }
    }
  }

  return Array.from(map.values())
}

const normalizeSentinelAddresses = (distributions: Distribution[]) =>
  distributions.map((d) => {
    const lower = d.destination.toLowerCase()
    if (lower === FURNACE_ADDRESS.toLowerCase()) {
      return { ...d, destination: FURNACE_ADDRESS }
    }
    if (lower === ST_RSR_ADDRESS.toLowerCase()) {
      return { ...d, destination: ST_RSR_ADDRESS }
    }
    return d
  })

const useRevenueDistributionSummary = (
  calls: ProposalCall[],
  snapshotBlock?: number
) => {
  const gqlClient = useAtomValue(gqlClientAtom)
  const rToken = useRToken()

  return useQuery({
    queryKey: [
      'revenueDistributionSummary',
      rToken?.address,
      snapshotBlock,
      calls.map((c) => c.callData),
    ],
    queryFn: async () => {
      if (!rToken?.address || !snapshotBlock) return null

      const result: any = await gqlClient.request(DISTRIBUTION_QUERY, {
        id: rToken.address.toLowerCase(),
        block: { number: snapshotBlock },
      })

      const rawDistributions: SubgraphDistribution[] =
        result?.rtoken?.revenueDistribution || []

      const currentDist = ensureValidDistribution(
        normalizeSentinelAddresses(parseDistributions(rawDistributions))
      )
      const proposedDist = applyDistributionChanges(currentDist, calls)
      const current = formatDistribution(currentDist)
      const proposed = formatDistribution(proposedDist)

      // Compare actual values to find what really changed
      const changedAddresses = new Set<string>()
      if (current.holders !== proposed.holders) {
        changedAddresses.add(FURNACE_ADDRESS.toLowerCase())
      }
      if (current.stakers !== proposed.stakers) {
        changedAddresses.add(ST_RSR_ADDRESS.toLowerCase())
      }
      const currentExtMap = new Map(
        current.external.map((e) => [e.address.toLowerCase(), e.total])
      )
      for (const ext of proposed.external) {
        const key = ext.address.toLowerCase()
        if (currentExtMap.get(key) !== ext.total) {
          changedAddresses.add(key)
        }
        currentExtMap.delete(key)
      }
      // Removed externals
      for (const [key] of currentExtMap) {
        changedAddresses.add(key)
      }

      return { current, proposed, changedAddresses }
    },
    enabled: !!rToken?.address && !!snapshotBlock && calls.length > 0,
  })
}

export default useRevenueDistributionSummary
