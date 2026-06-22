import useTrackPage from '@/hooks/useTrackPage'
import HomepageHero from './components/homepage-hero'
import { HistoricalPriceDisclaimer } from './components/highlighted-dtfs/historical-price-disclaimer'
import RegisterAbout from './components/register-about'

const Home = () => {
  useTrackPage('home')

  return (
    <div className="container">
      <HomepageHero />
      <HistoricalPriceDisclaimer />
      <RegisterAbout />
    </div>
  )
}

export default Home
