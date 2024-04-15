import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import { zeroAddress } from 'viem'

export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x43587CAA7dE69C3c2aD0fb73D4C9da67A8E35b0b',
  [ChainId.Base]: '0x9C75314AFD011F22648ca9C655b61674e27bA4AC',
  [ChainId.Hardhat]: '0x15480f5B5ED98A94e1d36b52Dd20e9a35453A38e',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x2815c24F49D5c5316Ffd0952dB0EFe68b0d5F132',
  [ChainId.Base]: '0xDf99ccA98349DeF0eaB8eC37C1a0B270de38E682',
  [ChainId.Hardhat]: '0x2815c24F49D5c5316Ffd0952dB0EFe68b0d5F132',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x801fF27bacc7C00fBef17FC901504c79D59E845C',
  [ChainId.Base]: '0x3d6D679c863858E89e35c925F937F5814ca687F3',
  [ChainId.Hardhat]: '0x30426D33a78afdb8788597D5BFaBdADc3Be95698',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3312507BC3F22430B34D5841A472c767DC5C36e4',
  [ChainId.Base]: '0x46c600CB3Fb7Bf386F8f53952D64aC028e289AFb',
  [ChainId.Hardhat]: '0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  [ChainId.Arbitrum]: '0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594',
  [ChainId.Hardhat]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Base]: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
  [ChainId.Arbitrum]: '0x12275DCB9048680c4Be40942eA4D92c74C63b844',
  [ChainId.Hardhat]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
}

export const RGUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x78da5799CF427Fee11e9996982F4150eCe7a99A7',
  [ChainId.Arbitrum]: '0x96a993f06951b01430523d0d5590192d650ebf3e',
}

/**
 * Other contract addresses
 */
export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Base]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
}

/**
 * Rewards addresses
 */
export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
}

export const COMP_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  [ChainId.Base]: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
}

export const CRV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
}

export const CVX_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
}

export const STG_ADDRESS: AddressMap = {
  [ChainId.Base]: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df',
}
