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
  [ChainId.Mainnet]: '0x5c46b718Cd79F2BBA6869A3BeC13401b9a4B69bB',
  [ChainId.Tenderly]: '0xDeC1B73754449166cB270AC83F4b536e738b1351',
  [ChainId.Goerli]: '0x7bdAbdA24406A293f230690Ad5305173d266B7d6',
  [ChainId.BaseGoerli]: '0xE77c43F499524FF354D2aFFbE815729613d8F856',
  [ChainId.Hardhat]: '0x687bB6c57915aa2529EfC7D2a26668855e022fAE',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xad0BFAEE863B1102e9fD4e6330A02B08d885C715',
  [ChainId.Tenderly]: '0x4024c00bBD0C420E719527D88781bc1543e63dd5',
  [ChainId.Goerli]: '0x62bf08e255706f3855821B2C25007a731D585E59',
  [ChainId.BaseGoerli]: '0x6490D66B17A1E9a460Ab54131165C8F921aCcDeB',
  [ChainId.Hardhat]: '0x9d136eEa063eDE5418A6BC7bEafF009bBb6CFa70',
}

export const FACADE_ACT_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x98f292e6Bb4722664fEffb81448cCFB5B7211469',
  [ChainId.Tenderly]: '0xBE9D23040fe22E8Bd8A88BF5101061557355cA04',
  [ChainId.Goerli]: '0x7Bcb39F6d2A902aF8adFe384Ec6D84ABE66D2065',
  [ChainId.BaseGoerli]: '0x5fE248625aC2AB0e17A115fef288f17AF1952402',
  [ChainId.Hardhat]: '0x30426D33a78afdb8788597D5BFaBdADc3Be95698',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x1656D8aAd7Ee892582B9D5c2E9992d9f94ff3629',
  [ChainId.Tenderly]: '0xb3Be23A0cEFfd1814DC4F1FdcDc1200b39922bCc',
  [ChainId.Goerli]: '0x264Fb85EF99cb2026de73ef0f6f74AFd6335a006',
  [ChainId.BaseGoerli]: '0xc87800FC32dd93b0584bb696326ED6a11Ef5221b',
  [ChainId.Hardhat]: '0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e',
}

// Override address for test if needed
if (import.meta.env.VITE_TENDERLY_MAINNET_URL) {
  DEPLOYER_ADDRESS[1] = '0xeEEC8Ef96000bB1F0920B3A871A09e1A6994CAc7'
  FACADE_ADDRESS[1] = '0x86533eaD27a52744571994dA04e83e8b253fC2c9'
  FACADE_ACT_ADDRESS[1] = '0x119B4c393b53A854190A1920e0271C0bEaE9eCcb'
  FACADE_WRITE_ADDRESS[1] = '0x065f735aF27fe703FBaA616FFc82B29949DeD1bC'
}

/**
 * RSV Related contracts
 * Only for Mainnet!
 */
export const RSV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.Tenderly]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.Goerli]: '0xC54cA3D2A4fE68D079b45c92D703DADfE3Ad0AA0',
  [ChainId.Hardhat]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.BaseGoerli]: ZERO_ADDRESS,
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
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending to be deployed
  [ChainId.Hardhat]: '0x5cAF60bf01A5ecd436b2Cd0b68e4c04547eCb872',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
  [ChainId.Tenderly]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
  [ChainId.Goerli]: '0x882BBbD5dd09DD77c15f89fE8B50fE48b7765835',
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending to be deployed
  [ChainId.Hardhat]: '0x159Af360D99b3dd6c4a47Cd08b730Ff7C9d113CC',
}

export const CVX_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.Tenderly]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.Goerli]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending to be deployed
  [ChainId.Hardhat]: '0xbE301280e593d1665A2D54DA65687E92f46D5c44',
}

export const CRV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.Tenderly]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.Goerli]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending to be deployed
  [ChainId.Hardhat]: '0x3752098adf2C9E1E17e48D9cE2Ea48961905064A',
}

/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Tenderly]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  [ChainId.Goerli]: '0xB58b5530332D2E9e15bfd1f2525E6fD84e830307',
  [ChainId.BaseGoerli]: '0xc8058960a9d7E7d81143BDBA38d19e6824165932',
  [ChainId.Hardhat]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
}

export const USDC_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.Tenderly]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.Goerli]: '0xfd7201C314532c4eF42CBF3fcB4A2f9CfCe0f57A',
  [ChainId.BaseGoerli]: '0x1265Ec05FD621d82F224814902c925a600307fb3',
  [ChainId.Hardhat]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}

export const EUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Tenderly]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.Goerli]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending
  [ChainId.Hardhat]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
}

/**
 * Other contract addresses
 */

export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Tenderly]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  [ChainId.Goerli]: '0x333Fc8f550043f239a2CF79aEd5e9cF4A20Eb41e',
  [ChainId.BaseGoerli]: ZERO_ADDRESS, // TODO: Pending
  [ChainId.Hardhat]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
}

const defaultTokens = Object.keys(tokenList).filter(
  (addr) => addr !== RSV_ADDRESS[ChainId.Mainnet]
)

// Fixed tokens used in the rtoken selector screen and dashboard
export const DEFAULT_TOKENS = {
  [ChainId.Mainnet]: defaultTokens,
  [ChainId.Tenderly]: defaultTokens,
  [ChainId.Base]: [],
  [ChainId.Goerli]: [RSV_ADDRESS[ChainId.Goerli]],
  [ChainId.BaseGoerli]: [],
  [ChainId.Hardhat]: [],
}
