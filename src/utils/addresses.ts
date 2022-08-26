import { AddressMap } from 'types'
import { ChainId } from 'utils/chains'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// The deployer version is also related to the protocol version
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
  [ChainId.Goerli]: '0x2A5679683fF5485F5D776841B1639255D3fDAF57',
  [ChainId.Hardhat]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
  [ChainId.Goerli]: '0xE11f82D1d1d1B0B6F4f7569721Ff58be487D5A29',
  [ChainId.Hardhat]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
  [ChainId.Goerli]: '0x468AA6da8BF5CBa01A0f6DE0Da6DaD0605C1198F',
  [ChainId.Hardhat]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
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

export const STAKE_AAVE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x82EdA215Fa92B45a3a76837C65Ab862b6C7564a8',
  [ChainId.Goerli]: '0x6715b44e9E3021e78647772A75A3BAE0e0E2bD27',
  [ChainId.Hardhat]: '0x82EdA215Fa92B45a3a76837C65Ab862b6C7564a8',
}

export const COMPOUND_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589',
  [ChainId.Goerli]: '0x8B4493db76159314b6a285254CD6667bAeD537ab',
  [ChainId.Hardhat]: '0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589',
}
