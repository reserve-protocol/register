import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga'

const RouteAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    ReactGA.initialize('G-DMSRQ8XLEE')
    ReactGA.pageview(location.pathname + location.search)
  }, [location])

  return null
}

export default RouteAnalytics
