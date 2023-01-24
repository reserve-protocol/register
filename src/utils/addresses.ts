import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// The deployer version is also related to the protocol version
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x9cAc8ED3297040626D8aA6317F5e29813A6A8fc6',
  [ChainId.Goerli]: '0xA6974b81dcB174057C054BfBef512Bb26DDc3cd0',
  [ChainId.Hardhat]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x3DAf5a7681a9cfB92fB38983EB3998dFC7963B28',
  [ChainId.Goerli]: '0x7321485aA1D0439296B882bBc85Eb0BD350F8381',
  [ChainId.Hardhat]: '0x3DAf5a7681a9cfB92fB38983EB3998dFC7963B28',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xF7bd1F8FdE9fBdc8436D45594e792e014c5ac966',
  [ChainId.Goerli]: '0xA4FA2df7b139C84D3DA5158316f277484308bF23',
  [ChainId.Hardhat]: '0xF7bd1F8FdE9fBdc8436D45594e792e014c5ac966',
}

export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x1895534f4D0fF3E632407DB5327cE3eAfCe2A9f6',
  [ChainId.Goerli]: '0x2738bf8E6fEdcb2d4297705fD72F65E8640a22b5',
  [ChainId.Hardhat]: '0x82EdA215Fa92B45a3a76837C65Ab862b6C7564a8',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xd9e49644f35b5233B5191b14882242bd0bdF58E8',
  [ChainId.Goerli]: '0x0DefA46e5e7258c9a776ADd56e6875a9323B9998',
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

export const BUSD_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  [ChainId.Goerli]: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  [ChainId.Hardhat]: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
}

export const WETH_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [ChainId.Goerli]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [ChainId.Hardhat]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
}

export const ORACLE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
  [ChainId.Goerli]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
  [ChainId.Hardhat]: '0x8263e161A855B644f582d9C164C66aABEe53f927',
}

// Fixed tokens used in the rtoken selector screen and dashboard
export const DEFAULT_TOKENS = {
  [ChainId.Mainnet]: [RSV_ADDRESS[ChainId.Mainnet]],
  [ChainId.Goerli]: [RSV_ADDRESS[ChainId.Goerli]],
  [ChainId.Hardhat]: [],
}
