import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from 'ethers/lib/utils'
import { ReserveToken, StringMap } from 'types'
import { CHAIN_ID } from 'utils/chains'
import {
  BUSD_ADDRESS,
  RSV_ADDRESS,
  RSV_MANAGER_ADDRESS,
  USDC_ADDRESS,
} from './addresses'
import { truncateDecimals } from './index'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const BUSD = BUSD_ADDRESS[CHAIN_ID]
const USDC = USDC_ADDRESS[CHAIN_ID]

export const getIssuable = (rsv: ReserveToken, tokenBalances: StringMap) => {
  let lowestCollateralBalance = Infinity

  for (const collateral of rsv.collaterals) {
    if (!tokenBalances[collateral.address]) {
      return 0
    }

    lowestCollateralBalance = Math.min(
      lowestCollateralBalance,
      tokenBalances[collateral.address]
    )
  }

  return truncateDecimals(lowestCollateralBalance)
}

export const quote = (amount: number): { [x: string]: BigNumber } => ({
  [USDC]: parseUnits(amount.toString(), 6),
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
