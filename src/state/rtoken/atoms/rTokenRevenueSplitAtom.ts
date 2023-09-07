import Distributor from 'abis/Distributor'
import { ExternalAddressSplit } from 'components/rtoken-setup/atoms'
import { gql } from 'graphql-request'
import { gqlClientAtom, publicClientAtom } from 'state/atoms'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { getContract } from 'wagmi/actions'
import rTokenContractsAtom from './rTokenContractsAtom'
import { parseAbiItem } from 'viem'

const shareToPercent = (shares: number): string => {
  return ((shares * 100) / 10000).toString()
}

interface Distribution {
  destination: string
  rTokenDist: number
  rsrDist: number
}

const formatDistribution = (data: Distribution[]) => {
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
    const client = get(publicClientAtom)

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

  return formatDistribution(request.rtoken.revenueDistribution)
})

export default rTokenRevenueSplitAtom
