import useTrackPage from '@/hooks/useTrackPage'
import DiscoverDTFS from './components/discover-dtfs'
import DtfTabs from './components/dtf-tabs'
import RegisterAbout from './components/register-about'

const Discover = () => {
  useTrackPage('discover')

  return (
    <div className="container pt-4 lg:pt-10">
      <DtfTabs />
      <DiscoverDTFS />
      <RegisterAbout />
    </div>
  )
}

export default Discover
