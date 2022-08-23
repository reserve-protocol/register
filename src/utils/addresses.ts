import { ChainId } from 'utils/chains'

type AddressMap = { [chainId: number]: string }

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// The deployer version is also related to the protocol version
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
  [ChainId.Goerli]: '0x02bf5735Ad21d20e6dd826b632B99ef4C5C12D26',
  [ChainId.Hardhat]: '0x139e1D41943ee15dDe4DF876f9d0E7F85e26660A',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
  [ChainId.Goerli]: '0x3020e6FD0a7825608D4262a8366694652396A2Dc',
  [ChainId.Hardhat]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513',
  [ChainId.Goerli]: '0x7cDB54Dfa8Bc3Bcfac58Dba9D925CdA21fE8B82B',
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
