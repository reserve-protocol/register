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
  [ChainId.Hardhat]: '0xD6b040736e948621c5b6E0a494473c47a6113eA8',
}

export const FACADE_WRITE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0xAdE429ba898c34722e722415D722A70a297cE3a2',
  [ChainId.Hardhat]: '0xAdE429ba898c34722e722415D722A70a297cE3a2',
}

export const RSR_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  [ChainId.Hardhat]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.Hardhat]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
}
