import useTrackPage from '@/hooks/useTrackPage'
import Hero from './components/hero'

const Home = () => {
  useTrackPage('home')

  return (
    <div className="container">
      <Hero />
    </div>
  )
}

export default Home
