import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// The deployer version is also related to the protocol version
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x092F139e9002ACB3dD51A64eD2bB527A30911b0E',
  [ChainId.Goerli]: '0x6D80CEE7065848233d81c7621C736149a6666979',
  [ChainId.Hardhat]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x798918a19AedDA5B923ffC053a63e6a96911dC0a',
  [ChainId.Goerli]: '0x8B84160CF8d9066Ba45f71471a06F2BFAc364626',
  [ChainId.Hardhat]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x97C6AdFe2979FBDd628e98B4121DB4C910e133d4',
  [ChainId.Goerli]: '0x261bccA3a9E67bDd1e5A1a3D72c5e3393843c824',
  [ChainId.Hardhat]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
}

export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x41e8574e4D88a69144aA59F27023E2ea67Be62Ad',
  [ChainId.Goerli]: '0x7b5109144EA8cC4903dE7F85012515D603226d93',
  [ChainId.Hardhat]: '0x82EdA215Fa92B45a3a76837C65Ab862b6C7564a8',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xa713E4f4FdBdBeb7881f9b8C316A8dCec0A4e6fa',
  [ChainId.Goerli]: '0x7e1Ee9185877Aaa0bF9689478Ff8e706eea1BD31',
  [ChainId.Hardhat]: '0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589',
}

export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  [ChainId.Goerli]: '0xB58b5530332D2E9e15bfd1f2525E6fD84e830307',
  [ChainId.Hardhat]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Goerli]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.Hardhat]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
}

export const RSV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  [ChainId.Goerli]: '0xC54cA3D2A4fE68D079b45c92D703DADfE3Ad0AA0',
  [ChainId.Hardhat]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
}

export const RSV_MANAGER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6',
  [ChainId.Goerli]: '0x08d95a020cE6FCfF46ACb323E2416Bc847D68b9a',
  [ChainId.Hardhat]: '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6',
}

export const USDC_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.Goerli]: '0xfd7201C314532c4eF42CBF3fcB4A2f9CfCe0f57A',
  [ChainId.Hardhat]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}

export const TUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x0000000000085d4780B73119b644AE5ecd22b376',
  [ChainId.Goerli]: '0xc6aA873112Ff1628a4b8512c5Cb666F2E3B4FD6A',
  [ChainId.Hardhat]: '0x0000000000085d4780B73119b644AE5ecd22b376',
}

export const PAX_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
  [ChainId.Goerli]: '0x1e0D00502E0DB65084EEaf95b525574E30DE41C5',
  [ChainId.Hardhat]: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
}

// Fixed tokens used in the rtoken selector screen and dashboard
export const DEFAULT_TOKENS = {
  [ChainId.Mainnet]: [
    RSV_ADDRESS[ChainId.Mainnet],
    '0x40008f2E9B40a5Cb6AfC9B2C9c018Ed109b8CB55', // RStable
    '0x08960600B7D30988555E10daD266C3FD69A616Bc', // REverything
  ],
  [ChainId.Goerli]: [RSV_ADDRESS[ChainId.Goerli]],
  [ChainId.Hardhat]: [
    '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
    '0x0bdB19551E641D25ea56AD1C66927313B331a955',
  ],
}
