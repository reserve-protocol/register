import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import { zeroAddress } from 'viem'

export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x2204EC97D31E2C9eE62eaD9e6E2d5F7712D3f1bF',
  [ChainId.Base]: '0xFD18bA9B2f9241Ce40CDE14079c1cDA1502A8D0A',
  [ChainId.Arbitrum]: '0xfd7eb6B208E1fa7B14E26A1fb10fFC17Cf695d68',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x2C7ca56342177343A2954C250702Fd464f4d0613',
  [ChainId.Base]: '0xeb2071e9b542555e90e6e4e1f83fa17423583991',
  [ChainId.Arbitrum]: '0x387A0C36681A22F728ab54426356F4CAa6bB48a9',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xCAB3D3d0d5544145A6BCB47e58F61368BCcAe2dB',
  [ChainId.Base]: '0x0eac15B9Fe585432E48Cf175571D75D111861F43',
  [ChainId.Arbitrum]: '0xE774CCF1431c3DEe7Fa4c20f67534b61289CAa45',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x1D94290F82D0B417B088d9F5dB316B11C9cf220C',
  [ChainId.Base]: '0x43E205A805c4be5A62C71d49de68dF60200548A0',
[ChainId.Arbitrum]: '0xe2B652E538543d02f985A5E422645A704633956d',
}

export const INDEX_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x',
  [ChainId.Base]: '0xaa599d1da0dcc11b3a27b78808f8a5e0209d2406',
  [ChainId.Arbitrum]: '0x',
}

export const INDEX_GOVERNANCE_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x',
  [ChainId.Base]: '0x6e32f4988f920c3fbb52573a67b6261a7704491b',
  [ChainId.Arbitrum]: '0x',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  [ChainId.Arbitrum]: '0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Base]: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
  [ChainId.Arbitrum]: '0x12275DCB9048680c4Be40942eA4D92c74C63b844',
}

export const RGUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x78da5799CF427Fee11e9996982F4150eCe7a99A7',
  [ChainId.Base]: '0x8E5E9DF4F0EA39aE5270e79bbABFCc34203A3470',
  [ChainId.Arbitrum]: '0x96a993f06951b01430523d0d5590192d650ebf3e',
}

export const ETHPLUS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
  [ChainId.Arbitrum]: '0x18c14c2d707b2212e17d1579789fc06010cfca23',
}

export const USD3_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x0d86883FAf4FfD7aEb116390af37746F45b6f378',
  [ChainId.Base]: '0xEFb97aaF77993922aC4be4Da8Fbc9A2425322677',
}

/**
 * Other contract addresses
 */
export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Base]: zeroAddress, // TODO: Pending
  [ChainId.Arbitrum]: zeroAddress, // TODO: Pending
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
  [ChainId.Arbitrum]: '0x354A6dA3fcde098F8389cad84b0182725c6C91dE',
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

export const ARB_ADDRESS: AddressMap = {
  [ChainId.Arbitrum]: '0x912CE59144191C1204E64559FE8253a0e49E6548',
}

export const AERO_ADDRESS: AddressMap = {
  [ChainId.Base]: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
}
