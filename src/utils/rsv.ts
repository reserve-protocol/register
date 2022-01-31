import { BigNumber } from 'ethers'
// TODO: Remove BN dependency
import BN from 'bn.js'

const TEN = new BN(10)
const SIX = TEN.pow(new BN(6))
const TWELVE = TEN.pow(new BN(12))
const EIGHTEEN = TEN.pow(new BN(18))
const USDC_RSV = new BN(333334)
const TUSD_RSV = new BN(333333)
const PAX_RSV = new BN(333333)

const PAX_QTY = BigNumber.from(333333)
const USDC_QTY = BigNumber.from(333334)
const EXPO = BigNumber.from(10).pow(BigNumber.from(12))
const DIV = BigNumber.from(10).pow(BigNumber.from(18))

// Collateral order
// [PAX, USDC, USDT]
export const getIssuable = (pax: number, usdc: number, tusd: number) => {
  if (!usdc || !tusd || !pax) {
    return 0
  }

  const usdcBN = new BN(usdc).mul(EIGHTEEN).div(USDC_RSV)
  const tusdBN = new BN(tusd).mul(SIX).div(TUSD_RSV)
  const paxBN = new BN(pax).mul(SIX).div(PAX_RSV)
  const min = BN.min(BN.min(usdcBN, tusdBN), paxBN)
  return min.div(EIGHTEEN).toNumber()
}

export const quote = (amount: BigNumber): BigNumber[] => [
  amount.mul(PAX_QTY).mul(EXPO).div(DIV),
  amount.mul(USDC_QTY).div(DIV),
  amount.mul(PAX_QTY).mul(EXPO).div(DIV),
]
