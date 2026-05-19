import useTrackPage from "@/hooks/useTrackPage"
import Hero from "./components/hero"
import FeedbackButton from "@/components/feedback-button"
import DiscoverDTFS from "./components/discover-dtfs"
import DtfTabs from "./components/dtf-tabs"
import RegisterAbout from "./components/register-about"

const Home = () => {
  useTrackPage('discover')

  return (
    <div className="container">
      <Hero />
      <DtfTabs />
      <DiscoverDTFS />
      <RegisterAbout />
      <FeedbackButton className="bottom-2" />
    </div>
  )
}

export default Home