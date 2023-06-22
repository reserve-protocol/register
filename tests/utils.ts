import { ethers } from 'ethers'

/**
 * Calculates the encoded slot for the balance mapping of an ERC20 token.
 * @param userAddress - The address of the user
 * @param mappingSlot - The storage slot number of the mapping
 * @returns The encoded slot
 */
export const getBalanceSlot = (userAddress: any, mappingSlot: any) => {
  return ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [userAddress, mappingSlot]
  )
}

export async function setBalanceAtSlot(params: {
  tokenAddress: string
  slotNumber: string
  value: string
  gui: any
}) {
  const { tokenAddress, slotNumber, value, gui } = params
  const userAddress = await gui.getWalletAddress()
  const userBalanceSlot = getBalanceSlot(userAddress, slotNumber)
  await gui.setContractStorageSlot(
    tokenAddress,
    userBalanceSlot,
    ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.BigNumber.from(value)),
      32
    )
  )
}
