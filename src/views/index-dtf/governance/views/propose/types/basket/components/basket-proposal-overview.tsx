import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { iTokenAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'

const BasketProposalOverview = () => {
  const dtf = useAtomValue(iTokenAtom)

  return (
    <div className="border-4 border-secondary rounded-3xl bg-card">
      <div className="flex items-center p-6 gap-2">
        <TokenLogo size="lg" />
        <h3 className="font-bold mr-auto">${dtf?.symbol}</h3>
        <Link to="../">
          <Button
            variant="outline"
            size="xs"
            className="rounded-[42px] font-light text-destructive hover:text-destructive"
          >
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default BasketProposalOverview
