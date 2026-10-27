import RevenueRouter from '@/abis/RevenueRouter'
import { EUSD_ADDRESS, EUSD_REVENUE_ROUTER_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import {
  Address,
  encodeFunctionData,
  formatUnits,
  getAddress,
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

export const toDestinationInputs = (
  destinations: readonly RevenueDestination[]
): DestinationInput[] =>
  destinations.map((d) => ({ ...d, multiplier: formatUnits(d.multiplier, 18) }))

export type DestinationField = keyof DestinationInput

// Strict: viem's encoder rejects a bad mixed-case checksum and would throw at render.
export const isDestinationAddress = (address: string) =>
  isAddress(address) &&
  ![
    zeroAddress,
    EUSD_ADDRESS[ChainId.Mainnet],
    EUSD_REVENUE_ROUTER_ADDRESS,
  ].some((a) => a.toLowerCase() === address.toLowerCase())

const parseMultiplier = (value: string) => {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) return null
  const multiplier = parseUnits(value, 18)
  return multiplier > 0n && multiplier < 1n << 96n ? multiplier : null
}

export const getDestinationErrors = (
  inputs: readonly DestinationInput[]
): Set<DestinationField>[] => {
  const seen = new Set<string>()
  return inputs.map((input) => {
    const errors = new Set<DestinationField>()
    const holder = input.holder.toLowerCase()
    if (!isDestinationAddress(input.holder) || seen.has(holder))
      errors.add('holder')
    if (!isDestinationAddress(input.recipient)) errors.add('recipient')
    if (parseMultiplier(input.multiplier) === null) errors.add('multiplier')
    seen.add(holder)
    return errors
  })
}

export const parseDestinations = (
  inputs: readonly DestinationInput[]
): RevenueDestination[] | null => {
  if (inputs.length > MAX_REVENUE_DESTINATIONS) return null
  if (getDestinationErrors(inputs).some((errors) => errors.size)) return null
  return inputs.map((input) => ({
    holder: getAddress(input.holder),
    recipient: getAddress(input.recipient),
    multiplier: parseMultiplier(input.multiplier)!,
  }))
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
