import { Suspense } from 'react'
import CompareSkeleton from './components/CompareSkeleton'
import YieldDTfList from './components/yield-dtf-list'
import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/macro'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

const Footer = () => (
  <div className="flex my-7 justify-center gap-3">
    <Link to={ROUTES.TOKENS}>
      <Button variant="outline" className="gap-2">
        <Trans>View All, including unlisted</Trans>
        <ArrowRight size={18} />
      </Button>
    </Link>
    <Link to={ROUTES.EXPLORER}>
      <Button variant="outline" className="gap-2">
        <Trans>Explore</Trans>
        <ArrowRight size={18} />
      </Button>
    </Link>
  </div>
)

/**
 * Main Compare screen
 */
const DiscoverYieldDTF = () => {
  return (
    <div>
      <Suspense fallback={<CompareSkeleton />}>
        <YieldDTfList />
      </Suspense>
      <Footer />
    </div>
  )
}

export default DiscoverYieldDTF
