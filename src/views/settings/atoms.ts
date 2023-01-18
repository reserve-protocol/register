import { atomWithReset } from 'jotai/utils'

export const rTokenParamsAtom = atomWithReset({
  tradingDelay: '',
  backingBuffer: '',
  maxTradeSlippage: '',
  minTradeVolume: '',
  rewardPeriod: '',
  rewardRatio: '',
  unstakingDelay: '',
  auctionLength: '',
  issuanceRate: '',
  scalingRedemptionRate: '',
  redemptionRateFloor: '',
  shortFreeze: '',
  longFreeze: '',
  maxTradeVolume: '',
})
