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

export const quote = (amount: BigNumber): BigNumber[] => [
  amount.mul(PAX_QTY).mul(EXPO).div(DIV),
  amount.mul(USDC_QTY).div(DIV),
  amount.mul(PAX_QTY).mul(EXPO).div(DIV),
]
