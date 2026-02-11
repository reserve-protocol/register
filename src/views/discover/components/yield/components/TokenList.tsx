import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

interface TokenListProps {
  className?: string
}

const TokenList = ({ className }: TokenListProps) => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
  }

  return (
    <div className={className}>
      <div className="pl-4 md:pl-6 mb-8">
        <h1 className="text-[32px] font-semibold tracking-wide mb-2">
          {t`Compare RTokens`}
        </h1>
        <p className="text-muted-foreground max-w-[720px]">
          {t`Including off-chain in-app transactions of RToken in the Reserve App.`}
        </p>
      </div>
      <ListedTokensTable />
      <div className="flex justify-center mt-6">
        <Button variant="ghost" onClick={handleViewAll}>
          <Trans>View All</Trans>
        </Button>
      </div>
    </div>
  )
}

export default TokenList
