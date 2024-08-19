import { ExternalAddressSplit } from 'components/rtoken-setup/atoms'
import { gql } from 'graphql-request'
import { chainIdAtom, gqlClientAtom } from 'state/atoms'
import { publicClient } from 'state/chain'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { parseAbiItem } from 'viem'
import rTokenContractsAtom from './rTokenContractsAtom'

export const shareToPercent = (shares: number): string => {
  return ((shares * 100) / 10000).toString()
}

export interface Distribution {
  destination: string
  rTokenDist: number
  rsrDist: number
}

export const formatDistribution = (data: Distribution[]) => {
  let holders = '0'
  let stakers = '0'
  const external: { [x: string]: ExternalAddressSplit } = {}

  for (const distribution of data) {
    const { destination, rTokenDist, rsrDist } = distribution

    if (!rTokenDist && !rsrDist) {
      delete external[destination]
    } else if (destination === FURNACE_ADDRESS) {
      holders = shareToPercent(rTokenDist) || '0'
    } else if (destination === ST_RSR_ADDRESS) {
      stakers = shareToPercent(rsrDist) || '0'
    } else {
      const holders = shareToPercent(rTokenDist)
      const stakers = shareToPercent(rsrDist)
      const total = +holders + +stakers

      external[destination] = {
        holders: ((+holders * 100) / total).toString() || '0',
        stakers: ((+stakers * 100) / total).toString() || '0',
        total: total.toString(),
        address: destination,
      }
    }
  }

  return { holders, stakers, external: Object.values(external) }
}

// If the distribution is not adding 10000, we add the remaining to the larger share
// This is a temporary fix until we have a better way to handle this
// There's a rounding issue in the subgraph (just UI issue).
const ensureValidDistribution = (data: Distribution[]) => {
  const total = data.reduce(
    (acc, { rTokenDist, rsrDist }) => acc + rTokenDist + rsrDist,
    0
  )

  if (total === 10000) {
    return data
  }

  const remaining = 10000 - total

  const sorted = data.sort(
    (a, b) => b.rTokenDist + b.rsrDist - (a.rTokenDist + a.rsrDist)
  )
  const largest = sorted[0]

  return [
    ...sorted.slice(1),
    {
      ...largest,
      ...(largest.rTokenDist > largest.rsrDist
        ? { rTokenDist: largest.rTokenDist + remaining }
        : { rsrDist: largest.rsrDist + remaining }),
    },
  ]
}

const rTokenRevenueSplitAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const gqlClient = get(gqlClientAtom)

  if (!contracts) {
    return null
  }

  const request: any = await gqlClient.request(
    gql`
      query getRTokenDistribution($id: String!) {
        rtoken(id: $id) {
          revenueDistribution {
            id
            rTokenDist
            rsrDist
            destination
          }
        }
      }
    `,
    { id: contracts.token.address.toLowerCase() }
  )

  if (!request?.rtoken?.revenueDistribution?.length) {
    const chainId = get(chainIdAtom)
    const client = publicClient({ chainId })

    if (!client) {
      return null
    }

    try {
      // const filter = await client.createContractEventFilter({
      //   abi: Distributor,
      //   address: contracts.distributor.address,
      //   eventName: 'DistributionSet',
      // })
      const events = (await client.getLogs({
        address: contracts.distributor.address,
        event: parseAbiItem('event DistributionSet(address,uint16,uint16)'),
      })) as any

      return formatDistribution(
        events.map(
          (event: any) =>
            ({
              ...(event?.args || {}),
              destination: event?.args?.dest || '0',
            } as Distribution)
        )
      )
    } catch (e) {
      console.error('Error pulling revenue distribution', e)
      return null
    }
  }

  const rawDist: Distribution[] = request.rtoken.revenueDistribution
  const validDist = ensureValidDistribution(rawDist)

  return formatDistribution(validDist)
})

export default rTokenRevenueSplitAtom
