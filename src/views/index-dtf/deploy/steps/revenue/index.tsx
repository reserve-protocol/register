import NextButton from '../../components/next-button'
import MintFeeSelector from '../fee/mint-fee-selector'
import FolioFeeSelector from '../fee/folio-fee-selector'
import RevenueDistributionSettings from './revenue-distribution-settings'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the RToken holders versus RSR
    stakers. It can also be configured to send a portion of the revenue of an
    RToken to any arbitrary Ethereum address (wallet or smart contract).
  </div>
)

const RevenueDistribution = () => {
  return (
    <>
      <Description />

      <FolioFeeSelector />
      <MintFeeSelector />
      <h1 className="text-2xl font-bold text-primary my-4 ml-6">
        Distribution
      </h1>
      <Description />
      <RevenueDistributionSettings />
      <NextButton />
    </>
  )
}

export default RevenueDistribution
