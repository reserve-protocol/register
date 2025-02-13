import { SwapDetails } from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import Decimal from 'decimal.js-light'
import { useAtomValue } from 'jotai'
import { selectedTokenOrDefaultAtom, slippageAtom } from './atom'
import { formatUnits } from 'viem'
import { formatCurrency, formatPercentage } from '@/utils'

export const ZapDetails = ({ data }: { data: ZapResult }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const slippage = useAtomValue(slippageAtom)
  const dtfAsTokenIn =
    data.tokenIn.toLowerCase() !== selectedToken.address.toLowerCase()

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
          right: <span>{formatPercentage(data.priceImpact)}</span>,
          help: 'The impact your trade has on the market price.',
        },
      ]}
    />
  )
}

export default ZapDetails
