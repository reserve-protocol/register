import DgnETHButtonAppendix from '@/components/utils/integrations/dgneth-btn-appendix'
import { Button } from '@/components/ui/button'
import { trackClick } from '@/hooks/useTrackPage'
import { ChainId } from '@/utils/chains'
import { t, Trans } from '@lingui/macro'
import { ListedToken } from 'hooks/useTokenList'
import { ROUTES } from 'utils/constants'
import EarnButton from './EarnButton'

interface TokenActionsProps {
  token: ListedToken
  onNavigate: (route: string) => void
}

const TokenActions = ({ token, onNavigate }: TokenActionsProps) => {
  return (
    <div className="flex items-center flex-wrap gap-2 md:gap-3 mt-0 md:mt-1">
      {token.chain !== ChainId.Arbitrum && (
        <DgnETHButtonAppendix
          rTokenSymbol={token.symbol}
          basketAPY={token.basketApy}
          borderColor="white"
          hideLabelOnMobile
        >
          <Button
            onClick={(e) => {
              e.stopPropagation()
              trackClick(
                'discover',
                'mint',
                token.id,
                token.symbol,
                token.chain
              )
              onNavigate(ROUTES.ISSUANCE)
            }}
            className="whitespace-nowrap"
          >
            {token.tokenApy
              ? `Mint ${token.tokenApy.toFixed(1)}% Est. APY`
              : 'Mint'}
          </Button>
        </DgnETHButtonAppendix>
      )}
      <Button
        size="default"
        onClick={(e) => {
          e.stopPropagation()
          trackClick(
            'discover',
            'stake',
            token.id,
            token.symbol,
            token.chain
          )
          onNavigate(ROUTES.STAKING)
        }}
        variant="outline"
        className="border-2"
      >
        <div className="flex items-center gap-2">
          <span>
            Stake RSR{' '}
            {!!token.stakingApy &&
              `- ${token.stakingApy.toFixed(1)}%`}
          </span>
          <span>{t`Est. APY`}</span>
        </div>
      </Button>

      <EarnButton token={token} className="hidden md:block" />
    </div>
  )
}

export default TokenActions
