import { Trans } from '@lingui/react/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import {
  estimatedApyAtom,
  rTokenPriceAtom,
  rTokenRevenueSplitAtom,
  rTokenStateAtom,
  rsrPriceAtom,
} from 'state/atoms'
import { formatCurrency, formatPercentage } from 'utils'
import { EUSD_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'

const EUSD_REVENUE_SHARE_URL =
  'https://forum.reserve.org/t/ip-revenue-share-programme-fintech-revenue-share-adjustment/1463'

const Row = ({
  operator,
  label,
  value,
  result,
}: {
  operator?: string
  label: ReactNode
  value: string
  result?: 'subtotal' | 'total'
}) => (
  <div
    className={cn(
      'flex items-center gap-2',
      result && 'border-t border-border pt-1 text-foreground',
      result === 'total' && 'font-semibold'
    )}
  >
    <span className="w-3 text-center font-mono">{operator}</span>
    <span>{label}</span>
    <span className="ml-auto pl-4 font-medium text-foreground">{value}</span>
  </div>
)

const StakingApyCalculation = () => {
  const rToken = useRToken()
  const revenueSplit = useAtomValue(rTokenRevenueSplitAtom)
  const { basket } = useAtomValue(estimatedApyAtom)
  const { tokenSupply, stTokenSupply, exchangeRate } =
    useAtomValue(rTokenStateAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const isEusd =
    rToken?.chainId === ChainId.Mainnet &&
    rToken.address.toLowerCase() === EUSD_ADDRESS[ChainId.Mainnet].toLowerCase()
  const symbol = rToken?.symbol ?? ''
  const stakersShare = +(revenueSplit?.stakers ?? 0)
  const marketCap = tokenSupply * rTokenPrice
  // Subtotals use the displayed (2-decimal) yield so each step checks on a calculator
  const basketShown = Math.round(basket * 100) / 100
  const annualYield = (marketCap * basketShown) / 100
  const stakersRevenue = (annualYield * stakersShare) / 100
  const stakedUsd = stTokenSupply * exchangeRate * rsrPrice
  const hasStake = Number.isFinite(stakedUsd) && stakedUsd > 0

  return (
    <div className="text-xs text-legend">
      <p className="mb-2">
        <Trans>
          Manually estimated APY calculated from basket averaged yield.
        </Trans>
      </p>
      {hasStake && (
        <div className="flex flex-col gap-1">
          <Row
            label={<Trans>{symbol} market cap</Trans>}
            value={`$${formatCurrency(marketCap, 0)}`}
          />
          <Row
            operator="×"
            label={<Trans>Basket yield</Trans>}
            value={`${basketShown.toFixed(2)}%`}
          />
          <Row
            operator="="
            label={<Trans>Annual collateral yield</Trans>}
            value={`$${formatCurrency(annualYield, 0)}`}
            result="subtotal"
          />
          <Row
            operator="×"
            label={<Trans>Revenue share to RSR stakers</Trans>}
            value={formatPercentage(stakersShare)}
          />
          <Row
            operator="="
            label={<Trans>Annual revenue to RSR stakers</Trans>}
            value={`$${formatCurrency(stakersRevenue, 0)}`}
            result="subtotal"
          />
          <Row
            operator="÷"
            label={<Trans>RSR staked (USD)</Trans>}
            value={`$${formatCurrency(stakedUsd, 0)}`}
          />
          <Row
            operator="="
            label={<Trans>Est. staking yield</Trans>}
            value={formatPercentage((stakersRevenue / stakedUsd) * 100)}
            result="total"
          />
        </div>
      )}
      {isEusd && (
        <p className="mt-2">
          <Trans>
            The RSR stakers' share includes the fintech revenue redirected to
            eusdRSR stakers under the eUSD Revenue Share Programme.
          </Trans>{' '}
          <a
            href={EUSD_REVENUE_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            <Trans>Learn more</Trans>
          </a>
        </p>
      )}
    </div>
  )
}

export default StakingApyCalculation
