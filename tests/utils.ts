import { ethers } from 'ethers'

export const getBalanceSlot = (userAddress: any, mappingSlot: any) => {
  return ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [userAddress, mappingSlot]
  )
}

export async function setBalanceAtSlot(params: {
  token: string
  slotNumber: string
  value: string
  gui: any
}) {
  const { token, slotNumber, value, gui } = params
  const userAddress = await gui.getWalletAddress()
  const userBalanceSlot = getBalanceSlot(userAddress, slotNumber)
  await gui.setContractStorageSlot(
    token,
    userBalanceSlot,
    ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.BigNumber.from(value)),
      32
    )
  )
  console.log(`Balance token ${token} = ${value}`)
}

export const getAllowanceSlot = (owner: any, spender: any, slotNumber: any) => {
  const innerMappingSlot = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [owner, slotNumber]
  )

  return ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [spender, innerMappingSlot]
  )
}

export async function setAllowanceAtSlot(params: {
  token: string
  spender: string
  value: string
  slotNumber: string
  gui: any
}) {
  const { token, spender, slotNumber, value, gui } = params
  const owner = await gui.getWalletAddress()
  const allowanceSlot = getAllowanceSlot(owner, spender, slotNumber)
  await gui.setContractStorageSlot(
    token,
    allowanceSlot,
    ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.BigNumber.from(value)),
      32
    )
  )
  console.log(`Allowance token ${token} for ${spender} = ${value}`)
}
