import { SwapDetails } from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import Decimal from 'decimal.js-light'
import { useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import { selectedTokenOrDefaultAtom } from './atom'

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
        : priceImpact < 0
          ? 'text-green-500'
          : isDetail
            ? ''
            : 'text-muted-foreground'
  return (
    <span className={priceImpactColor}>
      {isDetail ? '' : '('}
      {priceImpact > 0 ? (isDetail ? '' : '-') : '+'}
      {formatPercentage(Math.abs(priceImpact))}
      {!isDetail && priceImpact < 0 ? ' 😎' : ''}
      {isDetail ? '' : ')'}
    </span>
  )
}

const ZapDetails = ({ data }: { data: ZapResult }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const dtfAsTokenIn =
    data.tokenIn.toLowerCase() !== selectedToken.address.toLowerCase() &&
    data.tokenIn !== '0x4200000000000000000000000000000000000006' &&
    data.tokenIn !== '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

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
  const ratio = dtfAsTokenIn
    ? amountIn.eq(0)
      ? undefined
      : amountOut.div(amountIn)
    : amountOut.eq(0)
      ? undefined
      : amountIn.div(amountOut)
  const ratioText = `${formatCurrency(ratio?.toNumber() || 0)} ${tokenOutSymbol} = 1 ${tokenInSymbol}`
  const mintFeeValue = amountInValue.mul(indexDTF?.mintingFee || 0).toNumber()

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
                help: 'A one-time fee deduction from the tokens you are using to create a share of the DTF. This fee is set by the Governors of the DTF.',
              },
            ]
          : []),
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
