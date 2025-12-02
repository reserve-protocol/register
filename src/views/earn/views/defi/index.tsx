import { useEffect } from 'react'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import FeaturedPools from './components/featured-pools'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import DTFDefiEarn from './components/dtf-defi-earn'
import EarnHeading from './components/earn-heading'

const EarnDefi = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <>
      <EarnHeading />
      <div className="flex flex-col gap-3 mt-4 md:mt-6">
        <FeaturedPools />
        <DTFDefiEarn />
      </div>
      <RegisterAbout />
    </>
  )
}

export default EarnDefi
