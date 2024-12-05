import { Card } from '@/components/ui/card'
import LandingMint from './components/landing-mint'
import { Box } from '@/components/ui/box'
import { Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

const Performance = () => {
  return (
    <div className="rounded-2xl rounded-b-none bg-[#021122] color-[#fff] h-[500px]">
      chart
    </div>
  )
}

const TokenDetails = () => {
  return (
    <Card className="p-6 h-96">
      <div className="flex">
        card title
        <Link>
          <Box variant="circle">
            <LinkIcon size={12} />
          </Box>
          Website
        </Link>
      </div>
    </Card>
  )
}

const Content = () => {
  return (
    <div className="rounded-2xl bg-secondary flex-1">
      <Performance />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <TokenDetails />
        <TokenDetails />

        <TokenDetails />
        <TokenDetails />
        <TokenDetails />
      </div>
    </div>
  )
}

const DTFOverview = () => {
  return (
    <div className="flex gap-2">
      <Content />
      <div>
        <div className="sticky top-0">
          <LandingMint className="hidden xl:block" />
        </div>
      </div>
    </div>
  )
}

export default DTFOverview
