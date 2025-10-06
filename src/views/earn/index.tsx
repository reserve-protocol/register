import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import Earn from './components/earn'
import EarnHeading from './components/earn-heading'
import FeaturedPools from './components/featured-pools'

const EarnWrapper = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <div className="container pb-6 px-0 lg:px-4">
      <EarnHeading />
      <div className="flex flex-col gap-3 mt-4 md:mt-6">
        <FeaturedPools />
        <Earn />
      </div>
      <RegisterAbout />
    </div>
  )
}

export default EarnWrapper
