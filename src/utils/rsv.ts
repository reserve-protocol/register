import { parseEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { ReserveToken, StringMap } from 'types'
import { ONE_ETH } from '../constants'

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
  '0x8e870d67f660d95d5be530380d0ec0bd388289e1': amount
    .mul(PAX_QTY)
    .mul(EXPO)
    .div(DIV), // PAX
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': amount.mul(USDC_QTY).div(DIV), // USDC
  '0x0000000000085d4780B73119b644AE5ecd22b376': amount
    .mul(PAX_QTY)
    .mul(EXPO)
    .div(DIV), // USDT
})
