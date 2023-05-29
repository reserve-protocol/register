import { DistributorInterface } from 'abis'
import { gql } from 'graphql-request'
import { gqlClient } from 'hooks/useQuery'
import { getValidWeb3Atom } from 'state/atoms'
import { getContract } from 'utils'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenContractsAtom from './rTokenContractsAtom'
import { ExternalAddressSplit } from 'components/rtoken-setup/atoms'

interface RTokenRevenueDistribution {
  holders: string
  stakers: string
  external: {
    [x: string]: ExternalAddressSplit
  }
}

const shareToPercent = (shares: number): string => {
  return ((shares * 100) / 10000).toString()
}

interface Distribution {
  dest: string
  rTokenDist: number
  rsrDist: number
}

const formatDistribution = (data: Distribution[]) => {
  let holders = ''
  let stakers = ''
  const external: { [x: string]: ExternalAddressSplit } = {}

  for (const distribution of data) {
    const { dest, rTokenDist, rsrDist } = distribution

    if (!rTokenDist && !rsrDist) {
      delete external[dest]
    } else if (dest === FURNACE_ADDRESS) {
      holders = shareToPercent(rTokenDist) || '0'
    } else if (dest === ST_RSR_ADDRESS) {
      stakers = shareToPercent(rsrDist) || '0'
    } else {
      const holders = shareToPercent(rTokenDist)
      const stakers = shareToPercent(rsrDist)
      const total = +holders + +stakers

      external[dest] = {
        holders: ((+holders * 100) / total).toString() || '0',
        stakers: ((+stakers * 100) / total).toString() || '0',
        total: total.toString(),
        address: dest,
      }
    }
  }

  return { holders, stakers, external: Object.values(external) }
}

const rTokenRevenueSplitAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!contracts || !provider) {
    return null
  }

  try {
    const request: any = await gqlClient.request(gql`
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
    `)

    console.log('request', request)

    return formatDistribution(request.rtoken.revenueDistribution)
  } catch (e) {
    // If there is a theGraph error, try fetching distribution from chain events
    const contract = getContract(
      contracts.distributor.address,
      DistributorInterface,
      provider
    )
    const events = await contract.queryFilter(
      'DistributionSet(address,uint16,uint16)'
    )

    return formatDistribution(
      events.map((event) => (event?.args || { dest: '0' }) as Distribution)
    )
  }
})

export default rTokenRevenueSplitAtom
