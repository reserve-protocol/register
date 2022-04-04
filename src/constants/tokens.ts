import { StringMap, Token } from 'types'
import { ChainId, CHAIN_ID } from 'utils/chains'

type TokenMap = { [chainId: number]: Token }

const RSR_META: Token = {
  address: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  // TODO: RSR LOGO
  logo: 'rsv.png',
}

// RSR is linked to all `RTokens` with the exception of RSV
// Default Mainnet deployment
export const RSR_MAP: TokenMap = {
  [ChainId.Mainnet]: RSR_META,
  [ChainId.Hardhat]: RSR_META,
}

export const RSR: Token = RSR_MAP[CHAIN_ID]

// Best way to handle multiple chains is use the symbol instead of the address
export const tokenLogos: { [x: string]: string } = {
  RSDP: 'rsv.png',
  RSV: 'rsv.png',
  RSR: 'rsr.png',
}

export const meta: StringMap = {
  RSV: {
    about:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent vitae quam elit. Praesent nunc massa, porttitor ac lectus ut, hendrerit faucibus quam.',
    usage:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent vitae quam elit. Praesent nunc massa, porttitor ac lectus ut, hendrerit faucibus quam. ',
  },
}
