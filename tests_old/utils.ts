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

export const checkBalanceSlot = async (
  erc20Address: any,
  mappingSlot: any,
  provider: any
) => {
  // Get the balance slot for a zero address user
  const userAddress = ethers.constants.AddressZero
  const balanceSlot = getBalanceSlot(userAddress, mappingSlot)

  // Set the storage slot to a non-zero value
  const value: any = 0xdeadbeef
  const storageValue = ethers.utils.hexlify(ethers.utils.zeroPad(value, 32))
  await provider.send('anvil_setStorageAt', [
    erc20Address,
    balanceSlot,
    storageValue,
  ])

  // Check if the balance is equal to the value
  const erc20Contract = new ethers.Contract(
    erc20Address,
    ['function balanceOf(address) view returns (uint)'],
    provider
  )
  return (await erc20Contract.balanceOf(userAddress)) == value
}

export const findBalanceSlot = async (erc20Address: any, provider: any) => {
  // Take a snapshot of the blockchain state to revert to later
  const snapshot = await provider.send('evm_snapshot', [])

  // Iterate over the storage slots to find the balance mapping
  for (let slotNumber = 0; slotNumber < 100; slotNumber++) {
    try {
      if (await checkBalanceSlot(erc20Address, slotNumber, provider)) {
        // Revert to the snapshot to reset the blockchain state
        await provider.send('evm_revert', [snapshot])

        // Return the slot number
        return slotNumber
      }
    } catch {}

    // Revert to the snapshot to reset the blockchain state
    await provider.send('evm_revert', [snapshot])
  }
}

export const checkAllowanceSlot = async (
  erc20Address: any,
  mappingSlot: any,
  provider: any
) => {
  // Get the allowance slot for a zero address user and spender
  const userAddress = ethers.constants.AddressZero
  const spenderAddress = ethers.constants.AddressZero
  const allowanceSlot = getAllowanceSlot(
    userAddress,
    spenderAddress,
    mappingSlot
  )

  // Set the storage slot to a non-zero value
  const value: any = 0x07bcc9f5
  const storageValue = ethers.utils.hexlify(ethers.utils.zeroPad(value, 32))
  await provider.send('anvil_setStorageAt', [
    erc20Address,
    allowanceSlot,
    storageValue,
  ])

  // Check if the allowance is equal to the value
  const erc20Contract = new ethers.Contract(
    erc20Address,
    ['function allowance(address,address) view returns (uint)'],
    provider
  )
  return (await erc20Contract.allowance(userAddress, spenderAddress)) == value
}

export const findAllowanceSlot = async (erc20Address: any, provider: any) => {
  // Take a snapshot of the blockchain state to revert to later
  const snapshot = await provider.send('evm_snapshot', [])

  // Iterate over the storage slots to find the allowance mapping
  for (let slotNumber = 0; slotNumber < 100; slotNumber++) {
    try {
      if (await checkAllowanceSlot(erc20Address, slotNumber, provider)) {
        // Revert to the snapshot to reset the blockchain state
        await provider.send('evm_revert', [snapshot])

        // Return the slot number
        return slotNumber
      }
    } catch {}

    // Revert to the snapshot to reset the blockchain state
    await provider.send('evm_revert', [snapshot])
  }
}
