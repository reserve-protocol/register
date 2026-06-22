import useTrackPage from '@/hooks/useTrackPage'
import HomepageHero from './components/homepage-hero'
import RegisterAbout from './components/register-about'

const Home = () => {
  useTrackPage('home')

  return (
    <div className="container">
      <HomepageHero />
      <RegisterAbout />
    </div>
  )
}

export default Home
