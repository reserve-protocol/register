import { Token } from 'types'

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
export const RSR: Token = {
  address: '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  // TODO: RSR LOGO
  logo: 'rsv.png',
}
//

/**
 * Reserve Protocol Tokens
 * Mostly used for obtaining token information like the logo if it exists
 * This array contains only protocol related tokens like RSR/RSV/RToken
 */
const TOKENS: { [x: string]: Token } = {
  '0x9467a509da43cb50eb332187602534991be1fea4': {
    address: '0x9467a509da43cb50eb332187602534991be1fea4',
    name: 'RSD',
    symbol: 'RSD',
    decimals: 18,
    logo: 'rsv.png',
  },
  [RSV.address]: RSV,
  [RSR.address]: RSR,
}

export default TOKENS
