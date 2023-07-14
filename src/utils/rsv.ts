import { ReserveToken } from 'types'
import { Address, parseUnits } from 'viem'
import { RSV_ADDRESS, RSV_MANAGER_ADDRESS, USDC_ADDRESS } from './addresses'
import { ChainId } from './chains'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const USDC = USDC_ADDRESS[ChainId.Mainnet]

export const quote = (amount: string): { [x: Address]: bigint } => ({
  [USDC]: parseUnits(amount, 6),
})

const RSV: ReserveToken = {
  address: RSV_ADDRESS[ChainId.Mainnet],
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
  logo: '/svgs/rsv.svg',
  collaterals: [
    {
      address: USDC,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
}

export const RSV_MANAGER = RSV_MANAGER_ADDRESS[ChainId.Mainnet]

export default RSV
