import type { IndexDtfData } from '@reserve-protocol/react-sdk'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import {
  encodeFunctionData,
  keccak256,
  stringToHex,
  zeroHash,
  type Address,
  type Hex,
} from 'viem'

export const REBALANCE_MANAGER = keccak256(stringToHex('REBALANCE_MANAGER'))
export const AUCTION_LAUNCHER = keccak256(stringToHex('AUCTION_LAUNCHER'))

export function buildDeprecationCalls(
  address: Address,
  managers: readonly Address[],
  launchers: readonly Address[],
  ownerTimelock: Address
): { targets: Address[]; calldatas: Hex[] } {
  const revoke = (role: Hex, account: Address) =>
    encodeFunctionData({
      abi: dtfIndexAbi,
      functionName: 'revokeRole',
      args: [role, account],
    })
  const calldatas = [
    encodeFunctionData({ abi: dtfIndexAbi, functionName: 'deprecateFolio' }),
    ...managers.map((account) => revoke(REBALANCE_MANAGER, account)),
    ...launchers.map((account) => revoke(AUCTION_LAUNCHER, account)),
    revoke(zeroHash, ownerTimelock),
  ]
  return { targets: calldatas.map(() => address), calldatas }
}

export function canDeprecate(dtf: IndexDtfData, version: string | undefined) {
  const timelock = dtf.ownerGovernance?.timelock.id.toLowerCase()
  return (
    dtf.chainId === 8453 &&
    [
      '0xe00cfa595841fb331105b93c19827797c925e3e4',
      '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e',
    ].includes(dtf.id.toLowerCase()) &&
    version === '5.0.0' &&
    !!timelock &&
    dtf.roles.admin.all.length === 1 &&
    dtf.roles.admin.all[0].toLowerCase() === timelock
  )
}
