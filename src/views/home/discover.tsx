import FeedbackButton from '@/components/feedback-button'
import useTrackPage from '@/hooks/useTrackPage'
import DiscoverDTFS from './components/discover-dtfs'
import DtfTabs from './components/dtf-tabs'
import { DTFSubHeader } from './components/hero'
import RegisterAbout from './components/register-about'

const Discover = () => {
  useTrackPage('discover')

  return (
    <div className="container">
      <DTFSubHeader />
      <DtfTabs />
      <DiscoverDTFS />
      <RegisterAbout />
      <FeedbackButton className="bottom-2" />
    </div>
  )
}

export default Discover
