import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import EarnHeading from './views/defi/components/earn-heading'

const Navigation = () => {
  return <div>navigation</div>
}

const Earn = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <div className="container pb-6 px-0 lg:px-4">
      <Outlet />
    </div>
  )
}

export default Earn
