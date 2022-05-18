import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { ReserveToken, StringMap } from 'types'
import { ONE_ETH } from './numbers'

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
  '0x8E870D67F660D95d5be530380D0eC0bd388289E1': amount
    .mul(PAX_QTY)
    .mul(EXPO)
    .div(DIV), // PAX
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': amount.mul(USDC_QTY).div(DIV), // USDC
  '0x0000000000085d4780B73119b644AE5ecd22b376': amount
    .mul(PAX_QTY)
    .mul(EXPO)
    .div(DIV), // USDT
})
