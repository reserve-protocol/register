import { ChainId } from '@usedapp/core'

type AddressMap = { [chainId: number]: string }

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// TODO: protocol deployment
export const DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: ZERO_ADDRESS,
  [ChainId.Hardhat]: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
}

// Default RToken
// TODO: protocol deployment this may not be required????
export const RTOKEN_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: ZERO_ADDRESS,
  [ChainId.Hardhat]: '0x9467a509da43cb50eb332187602534991be1fea4',
}

export const RSV_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
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
  [ChainId.Hardhat]: '0x3aade2dcd2df6a8cac689ee797591b2913658659',
}
