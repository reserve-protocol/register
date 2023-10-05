import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import { zeroAddress } from 'viem'

export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x15480f5B5ED98A94e1d36b52Dd20e9a35453A38e',
  [ChainId.Base]: '0xf1B06c2305445E34CF0147466352249724c2EAC1',
  [ChainId.Hardhat]: '0x15480f5B5ED98A94e1d36b52Dd20e9a35453A38e',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
  [ChainId.Base]: '0xe1aa15DA8b993c6312BAeD91E0b470AE405F91BF',
  [ChainId.Hardhat]: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x801fF27bacc7C00fBef17FC901504c79D59E845C',
  [ChainId.Base]: '0x3d6D679c863858E89e35c925F937F5814ca687F3',
  [ChainId.Hardhat]: '0x30426D33a78afdb8788597D5BFaBdADc3Be95698',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x41edAFFB50CA1c2FEC86C629F845b8490ced8A2c',
  [ChainId.Base]: '0x0903048fD4E948c60451B41A48B35E0bafc0967F',
  [ChainId.Hardhat]: '0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  [ChainId.Hardhat]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Base]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
}

/**
 * Other contract addresses
 */

export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Base]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
}
