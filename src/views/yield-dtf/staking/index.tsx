import StakeContainer from './components/stake-container'
import Overview from './components/overview'
import Withdraw from './components/withdraw'
import StakePosition from './components/stake-position'

const Staking = () => (
  <div className="container py-1 md:py-6 px-0 sm:px-2">
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-0 lg:gap-4 xl:gap-5">
      <div className="pr-0 lg:pr-4">
        <StakeContainer />
        <StakePosition className="mt-5" />
        <Withdraw className="my-4" />
      </div>
      <Overview />
    </div>
  </div>
)

export default Staking
