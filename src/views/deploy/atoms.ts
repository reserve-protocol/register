import { StringMap } from 'types'
import { atom } from 'jotai'

// export const config: IConfig = {
//   maxTradeVolume: fp('1e6'), // $1M
//   dist: {
//     rTokenDist: bn(40), // 2/5 RToken
//     rsrDist: bn(60), // 3/5 RSR
//   },
//   rewardPeriod: bn('604800'), // 1 week
//   rewardRatio: fp('0.02284'), // approx. half life of 30 pay periods
//   unstakingDelay: bn('1209600'), // 2 weeks
//   tradingDelay: bn('0'), // (the delay _after_ default has been confirmed)
//   auctionLength: bn('900'), // 15 minutes
//   backingBuffer: fp('0.0001'), // 0.01%
//   maxTradeSlippage: fp('0.01'), // 1%
//   dustAmount: fp('0.01'), // 0.01 UoA (USD)
//   issuanceRate: fp('0.00025'), // 0.025% per block or ~0.1% per minute
//   oneshotPauseDuration: bn('864000'), // 10 days
//   minBidSize: fp('1'), // 1 UoA (USD)
// }

export const paramsDefaultState = {
  // token params
  name: '',
  symbol: '',
  ownerAddress: '',
  // backing params
  tradingDelay: '',
  auctionLength: '',
  backingBuffer: '',
  maxTradeSlippage: '',
  dustAmount: '',
  issuanceRate: '',
  // other
  maxTradeVolume: '1000000',
  rTokenDist: '40', // %
  rsrDist: '60', // %
  rewardPeriod: '604800', // seconds
  rewardRatio: '0.02284', // ? ask
  unstakingDelay: '1209600', // seconds 1 week
  oneshotPauseDuration: '864000', // seconds 10 days
  minBidSize: '',
}

// store error strings per field
export const formErrorsAtom = atom({
  ...paramsDefaultState,
})
export const deployerFormAtom = atom(paramsDefaultState)

export const updateFormAtom = atom(null, (get, set, data: StringMap) => {
  set(deployerFormAtom, { ...get(deployerFormAtom), ...data })
})

// derived form atoms
export const isFormValidAtom = atom((get) => {
  const fields = get(deployerFormAtom)
  const errors = get(formErrorsAtom)
})
