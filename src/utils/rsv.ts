import { _ReserveToken } from './../types/index'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { ReserveToken, StringMap } from 'types'
import { ONE_ETH } from './numbers'

/**
 * RSV Token utility
 *
 * * RSV is not part of the current Reserve Protocol, it was the first version of an rToken
 * * It follows different rules as other tokens, so it needs to be treated different
 * * Only the Overview page and Mint/Redeem are available for this token
 */
const PAX_ADDRESS = '0x8E870D67F660D95d5be530380D0eC0bd388289E1'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const TUSD_ADDRESS = '0x0000000000085d4780B73119b644AE5ecd22b376'
const PAX_QTY = BigNumber.from(333333)
const USDC_QTY = BigNumber.from(333334)
const EXPO = BigNumber.from(10).pow(BigNumber.from(12))
const DIV = BigNumber.from(10).pow(BigNumber.from(18))

// Collateral order
// [PAX, USDC, USDT]
export const getIssuable = (rsv: ReserveToken, tokenBalances: StringMap) => {
  let lowestCollateralBalance = Infinity

  for (const collateral of rsv.basket.collaterals) {
    if (!tokenBalances[collateral.token.address]) {
      return 0
    }

    lowestCollateralBalance = Math.min(
      lowestCollateralBalance,
      tokenBalances[collateral.token.address]
    )
  }

  return (
    parseEther(lowestCollateralBalance.toString())
      .div(ONE_ETH.div(3))
      .toNumber() || 0
  )
}

export const quote = (amount: BigNumber): { [x: string]: BigNumber } => ({
  [PAX_ADDRESS]: amount.mul(PAX_QTY).mul(EXPO).div(DIV), // PAX
  [USDC_ADDRESS]: amount.mul(USDC_QTY).div(DIV), // USDC
  [TUSD_ADDRESS]: amount.mul(PAX_QTY).mul(EXPO).div(DIV), // USDT
})

const RSV: _ReserveToken = {
  address: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
  collaterals: [
    {
      address: TUSD_ADDRESS,
      name: 'TrueUSD',
      symbol: 'TUSD',
      decimals: 18,
    },
    {
      address: PAX_ADDRESS,
      name: 'Pax Dollar',
      symbol: 'USDP',
      decimals: 18,
    },
    {
      address: USDC_ADDRESS,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  isRSV: true,
}

export default RSV
