import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from 'ethers/lib/utils'
import { BalanceMap, ReserveToken } from 'types'
import { CHAIN_ID } from 'utils/chains'
import { RSV_ADDRESS, RSV_MANAGER_ADDRESS, USDC_ADDRESS } from './addresses'
import { BI_ZERO } from './constants'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const USDC = USDC_ADDRESS[CHAIN_ID]

export const getIssuable = (rsv: ReserveToken, tokenBalances: BalanceMap) => {
  if (tokenBalances[USDC]) {
    return tokenBalances[USDC].value
  }

  return BI_ZERO
}

export const quote = (amount: string): { [x: string]: BigNumber } => ({
  [USDC]: parseUnits(amount, 6),
})

const RSV: ReserveToken = {
  address: RSV_ADDRESS[CHAIN_ID],
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
  isRSV: true,
}

export const RSV_MANAGER = RSV_MANAGER_ADDRESS[CHAIN_ID]

export default RSV
