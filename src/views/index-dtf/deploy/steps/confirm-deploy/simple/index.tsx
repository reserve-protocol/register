import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Input, NumericalInput } from '@/components/ui/input'
import { Trans } from '@lingui/macro'
import { ChevronDown, RefreshCw } from 'lucide-react'

const SimpleDeployButton = () => {
  return (
    <div className="m-2">
      <Button size="lg" className="w-full">
        Create
      </Button>
    </div>
  )
}

const RefreshQuote = () => {
  return (
    <Button className="gap-2 text-legend" variant="ghost">
      <RefreshCw size={16} />
      <Trans>Refresh quote</Trans>
    </Button>
  )
}

const TokenInput = () => {
  return (
    <div className="flex flex-col flex-grow">
      <NumericalInput
        variant="transparent"
        placeholder="0"
        onChange={() => {}}
      />
      <span className="text-legend mt-1.5">$blabla</span>
    </div>
  )
}

const TokenSelector = () => {
  return (
    <div className="flex flex-col gap-1">
      <Button variant="ghost" className="flex gap-2 text-2xl pr-0">
        <TokenLogo size="xl" />
        <span>USDC</span>
        <div className="bg-card rounded-full h-6 w-6">
          <ChevronDown />
        </div>
      </Button>
      <div className="flex items-center gap-1">
        <span className="text-legend">Balance</span>
        <span className="font-bold">1,45M</span>
        <Button
          variant="outline-primary"
          className="rounded-[40px] ml-1"
          size="xs"
        >
          Max
        </Button>
      </div>
    </div>
  )
}

const TokenInputBox = () => {
  return (
    <div className="p-4 bg-border/70 rounded-xl">
      <h3>You use:</h3>
      <div className="flex gap-2">
        <TokenInput />
        <TokenSelector />
      </div>
    </div>
  )
}

const TokenOutputBox = () => {
  return (
    <div className="p-4 bg-border/70 rounded-xl">
      <h3>You mint:</h3>
      <div className="flex items-center gap-2">
        <h4 className="text-3xl font-bold mr-auto">0</h4>
        <TokenLogo size="xl" />
        <h4 className="text-3xl font-bold">DTF</h4>
      </div>
      <div className="flex items-center"></div>
    </div>
  )
}

const SimpleIndexDeploy = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex items-center mx-6">
          <h4 className="font-bold mr-auto">How much do you want to mint?</h4>
          <RefreshQuote />
        </div>
        <div className="p-2">
          <TokenInputBox />
          <TokenOutputBox />
        </div>
      </div>
      <SimpleDeployButton />
    </div>
  )
}

export default SimpleIndexDeploy
