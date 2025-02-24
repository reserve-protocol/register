import HistoricalTVL from './components/historical-tvl'
import DiscoverTabs from './components/discover-tabs'
import RegisterAbout from './components/yield/components/RegisterAbout'
import Splash from './components/splash'
import FeedbackButton from '@/components/feedback-button'

const Discover = () => {
  return (
    <>
      <FeedbackButton />
      <HistoricalTVL />
      <DiscoverTabs className="mt-6 sm:mt-12" />
      <div className="container">
        <RegisterAbout />
      </div>
      <Splash />
    </>
  )
}

export default Discover
