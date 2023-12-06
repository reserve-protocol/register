import { useAtom } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import About from './components/About'
import Hero from './components/Hero'
import TokenList from './components/TokenList'
import CompareTokens from './components/CompareTokens'

/**
 * Main home screen
 */
const Home = () => {
  const [token, setToken] = useAtom(selectedRTokenAtom)

  // Unselect rToken if on this view ("back" browser action for example)
  useEffect(() => {
    mixpanel.track('Land on Home Page', {})
    if (token) {
      setToken(null)
    }
  }, [])

  return (
    <>
      <Hero />
      <CompareTokens />
      <About />
    </>
  )
}

export default Home
