import NextButton from '../../components/next-button'
import FolioFeeSelector from './folio-fee-selector'
import MintFeeSelector from './mint-fee-selector'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the RToken holders versus RSR
    stakers. It can also be configured to send a portion of the revenue of an
    RToken to any arbitrary Ethereum address (wallet or smart contract).
  </div>
)

const Fees = () => {
  return (
    <>
      <Description />
      <FolioFeeSelector />
      <MintFeeSelector />
      <NextButton />
    </>
  )
}

export default Fees
