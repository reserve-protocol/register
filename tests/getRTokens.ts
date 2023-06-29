/**
 * Given list of RTokens, fetch all collaterals from Facade contract then
 * find the ERC20 mapping
 */
import { ethers } from 'ethers'
import { Facade } from '../src/abis'
import { ChainId } from '../src/utils/chains'
import { FACADE_ADDRESS } from '../src/utils/addresses'
import { createAnvil } from '@viem/anvil'
import { config } from 'dotenv'

config()

const rtokens = [
  '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8', // ETH+
  '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F', // eUSD
  '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be', // hyUSD
]

export const getBalanceSlot = (userAddress: any, mappingSlot: any) => {
  return ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [userAddress, mappingSlot]
  )
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

export const getAllowanceSlot = (
  userAddress: any,
  spenderAddress: any,
  mappingSlot: any
) => {
  const innerMappingSlot = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [userAddress, mappingSlot]
  )

  return ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [spenderAddress, innerMappingSlot]
  )
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

async function main() {
  // Start anvil
  const anvil = createAnvil({
    forkUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.GUARDIAN_UI_ALCHEMY_API_KEY}`,
    forkBlockNumber: 17586536n,
  })
  await anvil.start()

  const anvilProvider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545'
  )
  const provider = new ethers.providers.JsonRpcProvider(
    'https://cloudflare-eth.com'
  )
  const facadeContract = new ethers.Contract(
    FACADE_ADDRESS[ChainId.Mainnet],
    Facade,
    provider
  )
  const data = {}
  for (const rtoken of rtokens) {
    const collaterals = await facadeContract.basketTokens(rtoken)
    for (const collateral of collaterals) {
      const balanceSlot = await findBalanceSlot(collateral, anvilProvider)
      const allowanceSlot = await findAllowanceSlot(collateral, anvilProvider)
      const rtokenData = data[rtoken]
      if (rtokenData == null) {
        data[rtoken] = [[collateral, balanceSlot, allowanceSlot]]
      } else {
        data[rtoken].push([collateral, balanceSlot, allowanceSlot])
      }
    }
  }

  console.log(JSON.stringify(data))

  await anvil.stop()
}

main()
