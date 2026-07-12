import { toFunctionSelector } from 'viem'

// 4-byte selector → human function signature, for FAILURE-ORIENTED unmocked
// messages: a red test then names the function and the helper to model it in,
// so an agent (or human) can make the next safe edit without decoding hex or
// scanning 900 lines of rpc.ts. Add signatures here as new reads surface —
// unknown selectors still log, just without a name.
const KNOWN_SIGNATURES = [
  // ERC20 / token metadata
  'name()',
  'symbol()',
  'decimals()',
  'totalSupply()',
  'balanceOf(address)',
  'allowance(address,address)',
  'approve(address,uint256)',
  // Governance / voting
  'getVotes(address)',
  'getVotes(address,uint256)',
  'getPastVotes(address,uint256)',
  'getPastTotalSupply(uint256)',
  'castVote(uint256,uint8)',
  'hasRole(bytes32,address)',
  'quorum(uint256)',
  'proposalThreshold()',
  'clock()',
  // Index folio (DTF)
  'version()',
  'totalAssets()',
  'getRebalance()',
  'daoFeeRegistry()',
  'toAssets(uint256,uint8)',
  'mint(uint256,address,uint256)',
  'redeem(uint256,address,uint256)',
  // Chainlink / price
  'latestRoundData()',
  'price(address)',
  'price()',
  // RToken / yield
  'issue(uint256)',
  'redeem(uint256)',
  'exchangeRate()',
  'basketsNeeded()',
  'main()',
  // Multicall
  'getEthBalance(address)',
] as const

const SELECTOR_NAMES: Record<string, string> = {}
for (const sig of KNOWN_SIGNATURES) {
  SELECTOR_NAMES[toFunctionSelector(sig).toLowerCase()] = sig
}

// The signature for a 4-byte selector, or undefined if unknown.
export function selectorName(selector: string): string | undefined {
  return SELECTOR_NAMES[selector.toLowerCase()]
}
