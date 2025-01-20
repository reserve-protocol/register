import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Asterisk } from 'lucide-react'

const ProposalTradingExpiration = () => {
  return (
    <>
      <p className="mx-6 mb-6">
        Set the new desired percentages and we will calculate the required
        trades needed to adopt the new basket if the proposal passes governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <div className="flex items-center gap-2 border rounded-xl p-4">
          <div className="flex items-center flex-shrink-0 justify-center w-8 h-8 bg-destructive/10 rounded-full text-destructive">
            <Asterisk size={24} strokeWidth={1.5} />
          </div>
          <div className="mr-auto">
            <h4 className="font-bold mb-1 text-base">
              Don’t allow permissionless launching
            </h4>
            <p className="text-sm text-legend">
              A trade should expire if the trade launcher does not launch within
              their 4h window.
            </p>
          </div>
          <Checkbox />
        </div>
        <div className="flex items-center gap-2 border rounded-xl p-4">
          <div className="flex items-center flex-shrink-0 justify-center w-8 h-8 bg-primary/10 text-primary rounded-full">
            <Asterisk size={24} strokeWidth={1.5} />
          </div>
          <div className="mr-auto">
            <h4 className="font-bold mb-1 text-base">
              Allow permissionless launching
            </h4>
            <p className="text-sm text-legend">
              Defined as the duration after X when anyone can start an auction.
            </p>
          </div>
          <Checkbox />
        </div>
        <Button className="w-full my-2" size="lg">
          Confirm
        </Button>
      </div>
    </>
  )
}

export default ProposalTradingExpiration
