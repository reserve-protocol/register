import FeedbackButton from '@/components/feedback-button'
import useTrackPage from '@/hooks/useTrackPage'
import DiscoverTabs from './components/discover-tabs'
import HistoricalTVL from './components/historical-tvl'
import Splash from './components/splash'
import RegisterAbout from './components/yield/components/RegisterAbout'

const Discover = () => {
  useTrackPage('discover')

  return (
    <>
      <HistoricalTVL />
      <DiscoverTabs className="mt-6 sm:mt-12" />
      <div className="container">
        <RegisterAbout />
      </div>
      <Splash />
      <FeedbackButton className="bottom-2" />
    </>
  )
}

export default Discover
