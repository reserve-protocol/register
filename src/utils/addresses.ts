import { ChainId } from 'utils/chains'

type AddressMap = { [chainId: number]: string }

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// TODO: protocol deployment
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x70bDA08DBe07363968e9EE53d899dFE48560605B',
  [ChainId.Hardhat]: '0x70bDA08DBe07363968e9EE53d899dFE48560605B',
}

export const FACADE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xaca81583840B1bf2dDF6CDe824ada250C1936B4D',
  [ChainId.Hardhat]: '0xaca81583840B1bf2dDF6CDe824ada250C1936B4D',
}

export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  [ChainId.Hardhat]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

export const ENS_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [ChainId.Hardhat]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Hardhat]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
}
