import { Button, Container } from 'components'
import { atom, useAtom } from 'jotai'
import TokenForm from './components/TokenForm'

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

const rTokenDataAtom = atom({
  name: '',
  nameError: '',
  symbol: '',
  symbolError: '',
  ownerAddress: '', // prefill on mount
  ownerAddressError: '',
})

const backingDataAtom = atom({
  tradingDelay: '',
  tradingDelayError: '',
  auctionLength: '',
  auctionLengthError: '',
  backingBuffer: '',
  backingBufferError: '',
  maxTradeSlippage: '',
  maxTradeSlippageError: '',
  dustAmount: '',
  dustAmountError: '',
  issuanceRate: '',
  issuanceRateError: '',
})

const otherDataAtom = atom({
  maxTradeVolume: '1000000',
  maxTradeVolumeError: '',
  rTokenDist: '40', // %
  rTokenDistError: '',
  rsrDist: '60', // %
  rsrDistError: '',
  rewardPeriod: '604800', // seconds
  rewardPeriodError: '',
  rewardRatio: '0.02284', // ? ask
  rewardRatioError: '',
  unstakingDelay: '1209600', // seconds 1 week
  unstakingDelayError: '',
  oneshotPauseDuration: '864000', // seconds 10 days
  oneshotPauseDurationError: '',
  minBidSize: '',
  minBidSizeError: '',
})

const Deploy = () => {
  return (
    <Container>
      <TokenForm />
      {/* {name} */}
      {/* <Button onClick={() => setName('test')}>set</Button> */}
    </Container>
  )
}

export default Deploy
