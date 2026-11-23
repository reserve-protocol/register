import useTrackPage from '@/hooks/useTrackPage'
import CountriesCard from './components/countries-card'
import { HeldCard, TransactionsCard, VolumeCard } from './components/data-cards'
import DataFootnote from './components/data-footnote'
import DiscoverDtfsCard from './components/discover-dtfs-card'
import FintechCard from './components/fintech-card'
import HomeHero from './components/home-hero'
import HomeStage from './components/home-stage'
import RegisterAbout from './components/register-about'
import UglyCashCard from './components/uglycash-card'

const Home = () => {
  useTrackPage('home')

  return (
    <div className="container">
      <HomeStage hero={<HomeHero />}>
        <HeldCard />
        <VolumeCard />
        <TransactionsCard />
        <CountriesCard />
        <UglyCashCard />
        <FintechCard />
        <DiscoverDtfsCard />
      </HomeStage>
      <DataFootnote />
      <RegisterAbout showIntro={false} />
    </div>
  )
}

export default Home
