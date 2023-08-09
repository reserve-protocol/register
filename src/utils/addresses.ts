import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'
import tokenList from 'utils/rtokens'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FURNACE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const ST_RSR_ADDRESS = '0x0000000000000000000000000000000000000002'

/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x339c1509b980D80A0b50858518531eDbe2940dA1',
  [ChainId.Tenderly]: '0xDeC1B73754449166cB270AC83F4b536e738b1351',
  [ChainId.Goerli]: '0x7bdAbdA24406A293f230690Ad5305173d266B7d6',
  [ChainId.Hardhat]: '0x5c46b718Cd79F2BBA6869A3BeC13401b9a4B69bB',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xad0BFAEE863B1102e9fD4e6330A02B08d885C715',
  [ChainId.Tenderly]: '0x4024c00bBD0C420E719527D88781bc1543e63dd5',
  [ChainId.Goerli]: '0x62bf08e255706f3855821B2C25007a731D585E59',
  [ChainId.Hardhat]: '0xf535Cab96457558eE3eeAF1402fCA6441E832f08',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xCFA67f42A0fDe4F0Fb612ea5e66170B0465B84c1',
  [ChainId.Tenderly]: '0xBE9D23040fe22E8Bd8A88BF5101061557355cA04',
  [ChainId.Goerli]: '0x7Bcb39F6d2A902aF8adFe384Ec6D84ABE66D2065',
  [ChainId.Hardhat]: '0x933c5DBdA80f03C102C560e9ed0c29812998fA78',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x1BD20253c49515D348dad1Af70ff2c0473FEa358',
  [ChainId.Tenderly]: '0xb3Be23A0cEFfd1814DC4F1FdcDc1200b39922bCc',
  [ChainId.Goerli]: '0x264Fb85EF99cb2026de73ef0f6f74AFd6335a006',
  [ChainId.Hardhat]: '0xdEBe74dc2A415e00bE8B4b9d1e6e0007153D006a',
}

/**
 * RSV Related contracts
 */
export const RSV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.Tenderly]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.Goerli]: '0xC54cA3D2A4fE68D079b45c92D703DADfE3Ad0AA0',
  [ChainId.Hardhat]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
}

export const RSV_MANAGER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6',
  [ChainId.Tenderly]: '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6',
  [ChainId.Goerli]: '0x08d95a020cE6FCfF46ACb323E2416Bc847D68b9a',
  [ChainId.Hardhat]: '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6',
}

/**
 * Collateral reward assets
 */
export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5cAF60bf01A5ecd436b2Cd0b68e4c04547eCb872',
  [ChainId.Tenderly]: '0x5cAF60bf01A5ecd436b2Cd0b68e4c04547eCb872',
  [ChainId.Goerli]: '0x7B025f359eB0490bB9bC52B755B8A45AC40676B9',
  [ChainId.Hardhat]: '0x5cAF60bf01A5ecd436b2Cd0b68e4c04547eCb872',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
  [ChainId.Tenderly]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
  [ChainId.Goerli]: '0x882BBbD5dd09DD77c15f89fE8B50fE48b7765835',
  [ChainId.Hardhat]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
}

export const CVX_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.Tenderly]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.Goerli]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.Hardhat]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
}

export const CRV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.Tenderly]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.Goerli]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.Hardhat]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Tenderly]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Goerli]: '0xB58b5530332D2E9e15bfd1f2525E6fD84e830307',
  [ChainId.Hardhat]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
}

export const USDC_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.Tenderly]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.Goerli]: '0xfd7201C314532c4eF42CBF3fcB4A2f9CfCe0f57A',
  [ChainId.Hardhat]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Tenderly]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Goerli]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Hardhat]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
}

/**
 * Other contract addresses
 */
export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Tenderly]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Goerli]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.Hardhat]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
}

export const ORACLE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
  [ChainId.Tenderly]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
  [ChainId.Goerli]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
  [ChainId.Hardhat]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
}

export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Tenderly]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Goerli]: '0x333Fc8f550043f239a2CF79aEd5e9cF4A20Eb41e',
  [ChainId.Hardhat]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
}

const defaultTokens = Object.keys(tokenList).filter(
  (addr) => addr !== RSV_ADDRESS[ChainId.Mainnet]
)

// Fixed tokens used in the rtoken selector screen and dashboard
export const DEFAULT_TOKENS = {
  [ChainId.Mainnet]: defaultTokens,
  [ChainId.Tenderly]: defaultTokens,
  [ChainId.Goerli]: [RSV_ADDRESS[ChainId.Goerli]],
  [ChainId.Hardhat]: [],
}
