import {
  Address,
  PublicClient,
  TestClient,
  encodeAbiParameters,
  formatUnits,
  keccak256,
  pad,
  parseAbiParameters,
  toHex,
  zeroAddress,
} from 'viem'

import { erc20ABI } from 'wagmi'
import { ERC20_DATA } from './constants'

export const getBalanceSlot = (userAddress: Address, mappingSlot: bigint) => {
  return keccak256(
    encodeAbiParameters(parseAbiParameters('address, uint256'), [
      userAddress,
      mappingSlot,
    ])
  )
}

export const checkBalanceSlot = async (
  erc20Address: Address,
  mappingSlot: bigint,
  testClient: TestClient,
  publicClient: PublicClient
): Promise<Boolean> => {
  // Get the balance slot for a zero address user
  const userAddress = zeroAddress
  const balanceSlot = getBalanceSlot(userAddress, mappingSlot)

  // Set the storage slot to a non-zero value
  const value = 0xdeadbeef
  const valueArray = new Uint8Array(32)
  const valueHex = value.toString(16)
  valueArray.set(Buffer.from(valueHex.padStart(64, '0'), 'hex'), 0)
  const storageValue = toHex(valueArray)

  await testClient.request({
    method: 'anvil_setStorageAt',
    params: [erc20Address, balanceSlot, storageValue],
  })

  const userBalance = await publicClient.readContract({
    address: erc20Address,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  })

  return userBalance.toString() === value.toString()
}

export const findBalanceSlot = async (
  erc20Address: Address,
  testClient: TestClient,
  publicClient: PublicClient
): Promise<bigint | undefined> => {
  // Take a snapshot of the blockchain state to revert to later
  const snapshot = await testClient.request({
    method: 'evm_snapshot',
    args: [],
  })

  // Iterate over the storage slots to find the balance mapping
  for (let slotNumber = 0; slotNumber < 100; slotNumber++) {
    try {
      const isBalanceSlot = await checkBalanceSlot(
        erc20Address,
        BigInt(slotNumber),
        testClient,
        publicClient
      )
      if (isBalanceSlot) {
        // Revert to the snapshot to reset the blockchain state
        await testClient.request({
          method: 'evm_revert',
          params: [snapshot],
        })

        // Return the slot number
        return BigInt(slotNumber)
      }
    } catch (e) {
      console.log('Error', e.message)
    }

    // Revert to the snapshot to reset the blockchain state
    await testClient.request({
      method: 'evm_revert',
      params: [snapshot],
    })
  }
}

export const setERC20Balance = async (
  account: Address,
  token: Address,
  amount: bigint,
  testClient: TestClient,
  publicClient: PublicClient
) => {
  if (!account) {
    throw new Error('Account not found')
  }

  const erc20 = ERC20_DATA[token]

  let balanceSlot: bigint | undefined = erc20?.balanceSlot

  if (!balanceSlot) {
    balanceSlot = await findBalanceSlot(token, testClient, publicClient)
  }

  if (!balanceSlot) {
    throw new Error('Balance slot not found')
  }

  // Calculate balanceOf[userAddress] storage slot
  const userBalanceSlot = getBalanceSlot(account, balanceSlot)

  await testClient.request({
    method: 'anvil_setStorageAt',
    params: [token, userBalanceSlot, pad(toHex(amount), { size: 32 })],
  })

  const userBalance = await publicClient.readContract({
    address: token,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [account],
  })

  console.log(
    `Balance of ${erc20?.symbol || token}: ${formatUnits(
      userBalance,
      erc20?.decimals || 18
    )}`
  )
}
