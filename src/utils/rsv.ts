import { ReserveToken } from 'types'
import { Address, parseUnits } from 'viem'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export const quote = (amount: string): { [x: Address]: bigint } => ({
  [USDC]: parseUnits(amount, 6),
})

const RSV: ReserveToken = {
  address: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
  logo: '/svgs/rsv.svg',
  chainId: 1,
  collaterals: [
    {
      address: USDC,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      protocol: 'GENERIC',
    },
  ],
}

export const RSVOverview = {
  dayVolume: 0,
  dayTxCount: 0,
  volume: 5784335728,
  txCount: 12640025,
  holders: 0,
}

export const RSV_MANAGER = '0x4B481872f31bab47C6780D5488c84D309b1B8Bb6'

export default RSV
