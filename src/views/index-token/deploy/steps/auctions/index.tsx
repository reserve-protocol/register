import NextButton from '../../components/next-button'
import AuctionsForm from './auctions-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The price curator is responsible for choosing a target price for the trade
    and initiating the dutch auction.
  </div>
)

const Auctions = () => {
  return (
    <>
      <Description />
      <AuctionsForm />
      <NextButton />
    </>
  )
}

export default Auctions
