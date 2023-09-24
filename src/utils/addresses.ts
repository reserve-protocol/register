import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import tokenList from 'utils/rtokens'
import { zeroAddress } from 'viem'
import RSV from './rsv'

export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x15480f5B5ED98A94e1d36b52Dd20e9a35453A38e',
  [ChainId.BaseGoerli]: '0xE77c43F499524FF354D2aFFbE815729613d8F856',
  [ChainId.Hardhat]: '0x15480f5B5ED98A94e1d36b52Dd20e9a35453A38e',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
  [ChainId.BaseGoerli]: '0x6490D66B17A1E9a460Ab54131165C8F921aCcDeB',
  [ChainId.Hardhat]: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x801fF27bacc7C00fBef17FC901504c79D59E845C',
  [ChainId.BaseGoerli]: '0x5fE248625aC2AB0e17A115fef288f17AF1952402',
  [ChainId.Hardhat]: '0x30426D33a78afdb8788597D5BFaBdADc3Be95698',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x41edAFFB50CA1c2FEC86C629F845b8490ced8A2c',
  [ChainId.BaseGoerli]: '0xc87800FC32dd93b0584bb696326ED6a11Ef5221b',
  [ChainId.Hardhat]: '0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e',
}

/**
 * Collateral reward assets
 */
export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x6647c880Eb8F57948AF50aB45fca8FE86C154D24',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x5cAF60bf01A5ecd436b2Cd0b68e4c04547eCb872',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xCFA67f42A0fDe4F0Fb612ea5e66170B0465B84c1',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
}

export const CVX_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4024c00bBD0C420E719527D88781bc1543e63dd5',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
}

export const CRV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x45B950AF443281c5F67c2c7A1d9bBc325ECb8eEA',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.BaseGoerli]: '0xc8058960a9d7E7d81143BDBA38d19e6824165932',
  [ChainId.Hardhat]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
}

/**
 * Other contract addresses
 */

export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.BaseGoerli]: zeroAddress, // TODO: Pending
  [ChainId.Hardhat]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
}

const defaultTokens = Object.keys(tokenList).filter(
  (addr) => addr !== RSV.address
)

// Fixed tokens used in the rtoken selector screen and dashboard
export const DEFAULT_TOKENS = {
  [ChainId.Mainnet]: defaultTokens,
  [ChainId.Tenderly]: defaultTokens,
  [ChainId.Base]: [],
  [ChainId.BaseGoerli]: [],
  [ChainId.Hardhat]: [],
}
