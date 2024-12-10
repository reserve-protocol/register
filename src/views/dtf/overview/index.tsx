import IndexAboutOverview from './components/index-about-overview'
import IndexBasketOverview from './components/index-basket-overview'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTokenOverview from './components/index-token-overview'
import LandingMint from './components/landing-mint'
import PriceChart from './components/price-chart'

const Content = () => {
  return (
    <div className="rounded-2xl bg-secondary flex-1">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <IndexTokenOverview />
        <IndexAboutOverview />
        <IndexBasketOverview />
        <IndexGovernanceOverview />
      </div>
    </div>
  )
}

const DTFOverview = () => {
  return (
    <div className="flex gap-2">
      <Content />
      <div>
        <div className="sticky top-0">
          <LandingMint className="hidden xl:block" />
        </div>
      </div>
    </div>
  )
}

export default DTFOverview
