import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Asterisk } from 'lucide-react'

const ProposalTradingRanges = () => {
  return (
    <>
      <p className="mx-6 mb-6">
        Set the new desired percentages and we will calculate the required
        trades needed to adopt the new basket if the proposal passes governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <div className="flex items-center gap-2 border rounded-xl p-4">
          <div className="flex items-center flex-shrink-0 justify-center w-8 h-8 bg-foreground/10 rounded-full">
            <Asterisk size={24} strokeWidth={1.5} />
          </div>
          <div className="mr-auto">
            <h4 className="font-bold mb-1 text-base">Defer to price curator</h4>
            <p className="text-sm text-legend">
              Explain the benefit of using our framwork & clarify that it
              doesn’t mean.
            </p>
          </div>
          <Checkbox />
        </div>
        <div className="flex items-center gap-2 border rounded-xl p-4">
          <div className="flex items-center flex-shrink-0 justify-center w-8 h-8 bg-foreground/10 rounded-full">
            <Asterisk size={24} strokeWidth={1.5} />
          </div>
          <div className="mr-auto">
            <h4 className="font-bold mb-1 text-base">
              Include price range(s) in proposal
            </h4>
            <p className="text-sm text-legend">
              Explain the benefit of using our framwork & clarify that it
              doesn’t mean.
            </p>
          </div>
          <Checkbox />
        </div>
        <Button className="w-full my-2">Mext | Set trade expiration</Button>
      </div>
    </>
  )
}

export default ProposalTradingRanges
