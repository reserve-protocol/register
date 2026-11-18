import { Trans } from '@lingui/react/macro'
import RToken from 'abis/RToken'
import Decimal from 'decimal.js-light'
import { useWatchReadContracts } from 'hooks/useWatchReadContract'
import { AlertTriangle } from 'lucide-react'
import { formatUnits } from 'viem'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useZap } from './context/ZapContext'

const ZapThrottleWarning = () => {
  const { operation, amountIn, tokenIn, tokenOut, chainId } = useZap()
  const rToken = operation === 'redeem' ? tokenIn : tokenOut
  const { data, isError } = useWatchReadContracts({
    contracts: rToken.address
      ? [
          {
            abi: RToken,
            address: rToken.address,
            chainId,
            functionName:
              operation === 'redeem'
                ? 'redemptionAvailable'
                : 'issuanceAvailable',
          },
        ]
      : [],
    allowFailure: false,
  })
  const available = data?.[0]

  if (
    isError ||
    available === undefined ||
    rToken.decimals === undefined ||
    !/^(?:\d+\.?\d*|\.\d+)$/.test(amountIn)
  )
    return null

  const capacity = formatUnits(available, rToken.decimals)
  const symbol = rToken.symbol
  let requested = new Decimal(amountIn)
  if (operation === 'mint') {
    if (
      !tokenIn.price ||
      !rToken.price ||
      !Number.isFinite(tokenIn.price) ||
      !Number.isFinite(rToken.price) ||
      tokenIn.price < 0 ||
      rToken.price < 0
    )
      return null
    requested = requested.mul(tokenIn.price).div(rToken.price)
  }
  if (!requested.gt(capacity)) return null

  return (
    <Alert
      variant="warning"
      className="mt-3 break-words"
      data-testid="zap-throttle-warning"
    >
      <AlertTriangle size={16} aria-hidden="true" />
      <AlertTitle>
        {operation === 'redeem' ? (
          <Trans>Redeem capacity exceeded</Trans>
        ) : (
          <Trans>Estimated Mint amount exceeds capacity</Trans>
        )}
      </AlertTitle>
      <AlertDescription className="text-foreground">
        <p>
          {operation === 'redeem' ? (
            <Trans>
              Currently available to Redeem: {capacity} {symbol}.
            </Trans>
          ) : (
            <Trans>
              Currently available to Mint: {capacity} {symbol}. The requested
              Mint amount is estimated from token prices.
            </Trans>
          )}
        </p>
        <p>
          <Trans>
            Larger swaps may use market liquidity with worse pricing. Reduce the
            amount to stay within protocol capacity.
          </Trans>
        </p>
      </AlertDescription>
    </Alert>
  )
}

export default ZapThrottleWarning
