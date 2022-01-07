import { Token, ReserveToken } from 'types'
import { RSV as RSV_TOKEN } from './tokens'

const PAX: Token = {
  address: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
  symbol: 'USDP',
  name: 'Pax Dollar',
  decimals: 18,
}

const USDC: Token = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
}

const USDT: Token = {
  address: '0x0000000000085d4780B73119b644AE5ecd22b376',
  symbol: 'TUSD',
  name: 'TrueUSD',
  decimals: 18,
}

/**
 * RSV - Reserve stable token before Mainnet release
 *
 * This `ReserveToken` doesnt have insurance but follows a similar issuance/redeem mechanism
 * This is also considered to be an `RToken` and it's the only hardcoded `RToken` of the explorer
 */
const RSV: ReserveToken = {
  // RSV Manager contract address
  id: '0x5BA9d812f5533F7Cf2854963f7A9d212f8f28673',
  token: RSV_TOKEN,
  vault: {
    // RSV Vault contract address
    // This contract is different for RTokens but fulfills a similar role
    id: '0x5BA9d812f5533F7Cf2854963f7A9d212f8f28673',
    collaterals: [
      {
        id: '0',
        index: 0,
        token: USDC,
      },
      {
        id: '1',
        index: 1,
        token: USDT,
      },
      {
        id: '2',
        index: 2,
        token: PAX,
      },
    ],
  },
}

export default RSV
