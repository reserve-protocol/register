import { CHAIN_ID } from 'utils/chains'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { ReserveToken, StringMap } from 'types'
import {
  PAX_ADDRESS,
  RSV_ADDRESS,
  RSV_MANAGER_ADDRESS,
  TUSD_ADDRESS,
  USDC_ADDRESS,
} from './addresses'
import { ONE_ETH } from './numbers'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const PAX = PAX_ADDRESS[CHAIN_ID]
const USDC = USDC_ADDRESS[CHAIN_ID]
const TUSD = TUSD_ADDRESS[CHAIN_ID]
const PAX_QTY = BigNumber.from(333333)
const USDC_QTY = BigNumber.from(333334)
const EXPO = BigNumber.from(10).pow(BigNumber.from(12))
const DIV = BigNumber.from(10).pow(BigNumber.from(18))

// Collateral order
// [PAX, USDC, USDT]
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

  return lowestCollateralBalance / 3
}

export const quote = (amount: BigNumber): { [x: string]: BigNumber } => ({
  [PAX]: amount.mul(PAX_QTY).mul(EXPO).div(DIV), // PAX
  [USDC]: amount.mul(USDC_QTY).div(DIV), // USDC
  [TUSD]: amount.mul(PAX_QTY).mul(EXPO).div(DIV), // USDT
})

const RSV: ReserveToken = {
  address: RSV_ADDRESS[CHAIN_ID],
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
  collaterals: [
    {
      address: TUSD,
      name: 'TrueUSD',
      symbol: 'TUSD',
      decimals: 18,
    },
    {
      address: PAX,
      name: 'Pax Dollar',
      symbol: 'USDP',
      decimals: 18,
    },
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
