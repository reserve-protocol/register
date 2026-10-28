import { parseAbi } from 'viem'

// reserve-protocol/revenue-router@4f889a35 (deployed eUSD router)
export default parseAbi([
  'function eUSD() view returns (address)',
  'function main() view returns (address)',
  'function MAX_DESTINATIONS() view returns (uint256)',
  'function destinations() view returns ((address holder, address recipient, uint96 multiplier)[] dests)',
  'function addDestinations((address holder, address recipient, uint96 multiplier)[] dests)',
  'function removeDestinations(address[] holders)',
  'function poke()',
  'function sweep(address token, address to, uint256 amount)',
  'event DestinationAdded(address indexed holder, address indexed recipient, uint96 multiplier)',
  'event DestinationRemoved(address indexed holder)',
  'event Distributed(address indexed holder, address indexed recipient, uint256 amount)',
  'event Swept(address indexed token, address indexed to, uint256 amount)',
  'error RevenueRouter__NotGovernance()',
  'error RevenueRouter__ZeroAddress()',
  'error RevenueRouter__TooManyDestinations(uint256 count)',
  'error RevenueRouter__InvalidDestination(address account)',
  'error RevenueRouter__InvalidMultiplier(address holder)',
  'error RevenueRouter__DuplicateHolder(address holder)',
  'error RevenueRouter__UnknownHolder(address holder)',
  'error RevenueRouter__ZeroHoldings()',
])
