import useTrackPage from '@/hooks/useTrackPage'
import HomepageHero from './components/homepage-hero'

const Home = () => {
  useTrackPage('home')

  return (
    <div className="container">
      <HomepageHero />
    </div>
  )
}

export default Home
