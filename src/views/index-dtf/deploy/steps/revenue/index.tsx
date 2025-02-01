import NextButton from '../../components/next-button'
import MintFeeSelector from '../fee/mint-fee-selector'
import FolioFeeSelector from '../fee/folio-fee-selector'
import RevenueDistributionSettings from './revenue-distribution-settings'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define how much the Index DTF will charge token holders to mint the DTF and
    to hold the DTF over time. A portion of these fees will be sent directly to
    the platform.
  </div>
)

const FeeDistributionDescription = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the DTF's creator, the vote-lock
    DAO, or any arbitrary address (wallet or smart contract).
  </div>
)

const RevenueDistribution = () => {
  return (
    <>
      <Description />
      <FolioFeeSelector />
      <MintFeeSelector />
      <h1 className="text-2xl font-bold text-primary my-4 ml-6">
        Fee Distribution
      </h1>
      <FeeDistributionDescription />
      <RevenueDistributionSettings />
      <NextButton />
    </>
  )
}

export default RevenueDistribution
