import { parseAbi } from 'viem'

// Ethereum deployment 0xdfD0CF858afe6010C83238461C6d7142d1b5265d.
// Matches reserve-protocol/revenue-router at 4f889a35715077b8e9fbf0eca9812e112d25a313.
// This deployment has addDestinations, NOT setDestinations.
export default parseAbi([
  'function destinations() view returns ((address holder, address recipient, uint96 multiplier)[] dests)',
  'function addDestinations((address holder, address recipient, uint96 multiplier)[] dests)',
  'function removeDestinations(address[] holders)',
  'error RevenueRouter__DuplicateHolder(address holder)',
  'error RevenueRouter__InvalidDestination(address account)',
  'error RevenueRouter__InvalidMultiplier(address holder)',
  'error RevenueRouter__NotGovernance()',
  'error RevenueRouter__TooManyDestinations(uint256 count)',
  'error RevenueRouter__UnknownHolder(address holder)',
])
