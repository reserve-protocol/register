import { ChainId } from 'utils/chains'

type AddressMap = { [chainId: number]: string }

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// The deployer version is also related to the protocol version
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
  [ChainId.Hardhat]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
  [ChainId.Hardhat]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
  [ChainId.Hardhat]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
}

export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  [ChainId.Hardhat]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Hardhat]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
}
