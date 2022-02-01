import { StringMap, Token } from 'types'

/**
 * These are Reserve constant tokens
 *
 * RSV - Pre-mainnet deployment Reserve stable ERC20 token
 * RSR - Insurance token for RTokens
 */
export const RSV: Token = {
  address: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
  // TODO: Specific logo for RSV
  logo: 'rsv.png',
}

// RSR is linked to all `RTokens` with the exception of RSV
// Default Mainnet deployment
export const RSR: Token = {
  address: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  // TODO: RSR LOGO
  logo: 'rsv.png',
}

// Best way to handle multiple chains is use the symbol instead of the address
export const tokenLogos: { [x: string]: string } = {
  RSD: 'rsv.png',
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
