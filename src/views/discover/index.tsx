import HistoricalTVL from './components/historical-tvl'
import DiscoverTabs from './components/discover-tabs'
import RegisterAbout from './components/yield/components/RegisterAbout'

const Discover = () => {
  return (
    <>
      <HistoricalTVL />
      <DiscoverTabs className="mt-6 sm:mt-12" />
      <div className="container">
        <RegisterAbout />
      </div>
    </>
  )
}

export default Discover
