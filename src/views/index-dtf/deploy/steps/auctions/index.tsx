import NextButton from '../../components/next-button'
import AuctionsForm from './auctions-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The Reserve Index Protocol uses dutch auctions any time when modifying token
    weights in the basket. A dutch auction is a type of auction where the token
    on sale starts at a high price, with the price lowering gradually until
    buyers place enough bids to fill the lot.
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
