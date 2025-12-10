import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import { zeroAddress } from 'viem'

export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xd5fcf4795877Ad0084FFc554b71D61bb660255AC',
  [ChainId.Base]: '0x1142Ad5E5A082077A7d79d211726c1bd39b0D5FA',
  [ChainId.Arbitrum]: '0xfd7eb6B208E1fa7B14E26A1fb10fFC17Cf695d68',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x2C7ca56342177343A2954C250702Fd464f4d0613',
  [ChainId.Base]: '0xeb2071e9b542555e90e6e4e1f83fa17423583991',
  [ChainId.Arbitrum]: '0x387A0C36681A22F728ab54426356F4CAa6bB48a9',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xCAB3D3d0d5544145A6BCB47e58F61368BCcAe2dB',
  [ChainId.Base]: '0x72be467048a4d9cbcc599251243f3ed9f46a42f5',
  [ChainId.Arbitrum]: '0xE774CCF1431c3DEe7Fa4c20f67534b61289CAa45',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA8Ea6cF7beAB5E4395D437AE37D696E007739357',
  [ChainId.Base]: '0x357d4dB0c2179886334cC33B8528048F7E1D3Fe3',
  [ChainId.Arbitrum]: '0xe2B652E538543d02f985A5E422645A704633956d',
}

export const VERSION_REGISTRY_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xba8cd83f793aa046fe5ab7ba01f855742f2d6a30',
  [ChainId.Base]: '0x3bece5ec596331033726e5c6c188c313ff4e3fe5',
}

export const ASSET_PLUGIN_REGISTRY_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x6cf05Ea2A94a101CE6A44Ec2a2995b43F1b0958f',
  [ChainId.Base]: '0x87A959e0377C68A50b08a91ae5ab3aFA7F41ACA4',
}

export const DAO_FEE_REGISTRY_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xec716deD4eABa060937D1a915F166E237039342B',
  [ChainId.Base]: '0x3513D2c7D2F51c678889CeC083E7D7Ae27b219aD',
}

export const TRUSTED_FILLER_REGISTRY_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x279ccF56441fC74f1aAC39E7faC165Dec5A88B3A',
  [ChainId.Base]: '0x72DB5f49D0599C314E2f2FEDf6Fe33E1bA6C7A18',
}

export const INDEX_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xBE3B47587cEeff7D48008A0114f51cD571beC63A',
  [ChainId.Base]: '0xA203AA351723cf943f91684e9F5eFcA7175Ae7EA',
  [ChainId.Arbitrum]: '0x',
  [ChainId.BSC]: '0x5Bed18AcA50E6057E6658Fe8498004092EedCDcF',
}

export const INDEX_GOVERNANCE_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5Bed18AcA50E6057E6658Fe8498004092EedCDcF',
  [ChainId.Base]: '0x1A7D043c84fe781b6df046fEfCf673F71110208D',
  [ChainId.Arbitrum]: '0x',
  [ChainId.BSC]: '0x270d928b9Ee38BAD93601D197256390b3c3C13Ec',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  [ChainId.Arbitrum]: '0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594',
  [ChainId.BSC]: '0x23f72a3Db61D6CB8aBE5d9AF1Ac4B6c99327bFee',
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
  [ChainId.BSC]: zeroAddress, // TODO: Pending
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
