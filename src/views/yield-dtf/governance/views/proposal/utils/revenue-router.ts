import RevenueRouter from '@/abis/RevenueRouter'
import { EUSD_ADDRESS, EUSD_REVENUE_ROUTER_ADDRESS } from '@/utils/addresses'
import {
  Address,
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseUnits,
  zeroAddress,
} from 'viem'

export const MAX_REVENUE_DESTINATIONS = 100
export type RevenueDestination = {
  holder: Address
  recipient: Address
  multiplier: bigint
}
export type DestinationInput = {
  holder: string
  recipient: string
  multiplier: string
}

export const isEusdRevenueRouter = (
  token?: { chainId: number; address: string } | null
) =>
  token?.chainId === 1 &&
  token.address.toLowerCase() === EUSD_ADDRESS[1].toLowerCase()

export const toDestinationInputs = (
  destinations: readonly RevenueDestination[]
): DestinationInput[] =>
  destinations.map((d) => ({ ...d, multiplier: formatUnits(d.multiplier, 18) }))

export const isDestinationAddress = (address: string) =>
  isAddress(address, { strict: false }) &&
  ![zeroAddress, EUSD_ADDRESS[1], EUSD_REVENUE_ROUTER_ADDRESS].some(
    (a) => a.toLowerCase() === address.toLowerCase()
  )

export const parseDestinations = (
  inputs: readonly DestinationInput[]
): RevenueDestination[] | null => {
  if (inputs.length > MAX_REVENUE_DESTINATIONS) return null
  const holders = new Set<string>()
  const destinations: RevenueDestination[] = []
  for (const input of inputs) {
    if (
      !isDestinationAddress(input.holder) ||
      !isDestinationAddress(input.recipient) ||
      holders.has(input.holder.toLowerCase()) ||
      !/^\d+(\.\d{1,18})?$/.test(input.multiplier)
    )
      return null
    const multiplier = parseUnits(input.multiplier, 18)
    if (multiplier <= 0n || multiplier >= 1n << 96n) return null
    holders.add(input.holder.toLowerCase())
    destinations.push({
      holder: input.holder as Address,
      recipient: input.recipient as Address,
      multiplier,
    })
  }
  return destinations
}

// EnumerableSet removals reorder entries: identity is the holder, never row index.
export const getDestinationChanges = (
  current: readonly RevenueDestination[],
  proposed: readonly RevenueDestination[]
) => {
  const unchanged = (
    destination: RevenueDestination,
    list: readonly RevenueDestination[]
  ) =>
    list.some(
      (d) =>
        d.holder.toLowerCase() === destination.holder.toLowerCase() &&
        d.recipient.toLowerCase() === destination.recipient.toLowerCase() &&
        d.multiplier === destination.multiplier
    )
  return {
    removed: current.filter((d) => !unchanged(d, proposed)),
    added: proposed.filter((d) => !unchanged(d, current)),
  }
}

export const buildRevenueRouterCalls = (
  current: readonly RevenueDestination[],
  proposed: readonly RevenueDestination[]
) => {
  const { removed, added } = getDestinationChanges(current, proposed)
  const calls: { address: Address; calldata: `0x${string}` }[] = []
  // Remove first: changed holders cannot be added twice, and replacements must fit the cap.
  if (removed.length)
    calls.push({
      address: EUSD_REVENUE_ROUTER_ADDRESS,
      calldata: encodeFunctionData({
        abi: RevenueRouter,
        functionName: 'removeDestinations',
        args: [removed.map((d) => d.holder)],
      }),
    })
  if (added.length)
    calls.push({
      address: EUSD_REVENUE_ROUTER_ADDRESS,
      calldata: encodeFunctionData({
        abi: RevenueRouter,
        functionName: 'addDestinations',
        args: [added],
      }),
    })
  return calls
}
