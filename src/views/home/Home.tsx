import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import Hero from './components/Hero'
import CompareTokens from './components/CompareTokens'
import RegisterAbout from './components/RegisterAbout'

/**
 * Main home screen
 */
const Home = () => {
  const [token, setToken] = useAtom(selectedRTokenAtom)

  // Unselect rToken if on this view ("back" browser action for example)
  useEffect(() => {
    if (token) {
      setToken(null)
    }
  }, [])

  return (
    <>
      <Hero />
      <CompareTokens />
      <RegisterAbout />
    </>
  )
}

export default Home
