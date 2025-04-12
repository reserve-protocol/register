import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga'

const RouteAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    ReactGA.initialize('GTM-WPKVXLPX')
    ReactGA.pageview(location.pathname + location.search)
  }, [location])

  return null
}

export default RouteAnalytics
