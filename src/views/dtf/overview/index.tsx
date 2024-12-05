import { Card } from '@/components/ui/card'
import LandingMint from './components/landing-mint'

const Performance = () => {
  return (
    <div className="rounded-2xl rounded-b-none bg-[#021122] color-[#fff] h-[500px]">
      chart
    </div>
  )
}

const TokenDescription = () => {
  return (
    <Card className="p-6 h-96">
      <div className="flex">card title</div>
    </Card>
  )
}

const Content = () => {
  return (
    <div className="rounded-2xl bg-secondary flex-1">
      <Performance />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <TokenDescription />
        <TokenDescription />

        <TokenDescription />
        <TokenDescription />
        <TokenDescription />
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
