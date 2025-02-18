import { SwapDetails } from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import Decimal from 'decimal.js-light'
import { useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import { selectedTokenOrDefaultAtom, slippageAtom } from './atom'

export const ZapPriceImpact = ({
  data,
  isDetail = false,
}: {
  data?: ZapResult
  isDetail?: boolean
}) => {
  const priceImpact = data?.truePriceImpact || 0
  const priceImpactColor =
    priceImpact > 10
      ? 'text-red-500'
      : priceImpact > 5
        ? 'text-yellow-500'
        : priceImpact <= -5
          ? 'text-green-500'
          : isDetail
            ? ''
            : 'text-muted-foreground'
  return (
    <span className={priceImpactColor}>
      {isDetail ? '' : '('}
      {priceImpact > 0 ? (isDetail ? '' : '-') : '+'}
      {formatPercentage(Math.abs(priceImpact))}
      {isDetail ? '' : ')'}
    </span>
  )
}

const ZapDetails = ({ data }: { data: ZapResult }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const slippage = useAtomValue(slippageAtom)
  const dtfAsTokenIn =
    data.tokenIn.toLowerCase() !== selectedToken.address.toLowerCase() &&
    data.tokenIn !== '0x4200000000000000000000000000000000000006'

  const tokenInSymbol = dtfAsTokenIn
    ? indexDTF?.token.symbol || ''
    : selectedToken.symbol
  const tokenOutSymbol = dtfAsTokenIn
    ? selectedToken.symbol
    : indexDTF?.token.symbol || ''

  const amountIn = new Decimal(
    formatUnits(
      BigInt(data.amountIn || 0),
      dtfAsTokenIn ? 18 : selectedToken.decimals
    )
  )
  const amountOut = new Decimal(
    formatUnits(
      BigInt(data.amountOut || 0),
      dtfAsTokenIn ? selectedToken.decimals : 18
    )
  )

  const amountInValue = new Decimal(data.amountInValue || 0)
  const tokenInPrice = amountIn.eq(0) ? undefined : amountInValue.div(amountIn)
  const ratio = amountOut.eq(0) ? undefined : amountIn.div(amountOut)
  const ratioText = `${formatCurrency(ratio?.toNumber() || 0)} ${tokenOutSymbol} = 1 ${tokenInSymbol}`
  const mintFeeValue = amountInValue.mul(indexDTF?.mintingFee || 0).toNumber()
  const maxSlippage = (1 / Number(slippage)) * 100

  if (!indexDTF) return null

  return (
    <SwapDetails
      visible={{
        left: (
          <span>
            {ratioText}{' '}
            <span className="text-muted-foreground">
              (${formatCurrency(tokenInPrice?.toNumber() || 0)})
            </span>
          </span>
        ),
        right: !dtfAsTokenIn ? (
          <span>
            <span className="text-muted-foreground">Fee</span>{' '}
            {formatPercentage(indexDTF.mintingFee * 100)}
          </span>
        ) : undefined,
      }}
      details={[
        ...(!dtfAsTokenIn
          ? [
              {
                left: <span className="text-muted-foreground">Mint Fee</span>,
                right: (
                  <span>
                    ${formatCurrency(mintFeeValue)}{' '}
                    <span className="text-muted-foreground">
                      ({formatPercentage(indexDTF.mintingFee * 100)})
                    </span>
                  </span>
                ),
                help: 'A one-time fee deducted from the tokens a user receives when they mint the DTF. The platform will keep 50% of revenue from this fee.',
              },
            ]
          : []),
        {
          left: <span className="text-muted-foreground">Max Slippage</span>,
          right: <span>{formatPercentage(maxSlippage)}</span>,
          help: 'The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted.',
        },
        {
          left: <span className="text-muted-foreground">Price Impact</span>,
          right: <ZapPriceImpact data={data} isDetail />,
          help: 'The impact your trade has on the market price.',
        },
      ]}
    />
  )
}

export default ZapDetails
