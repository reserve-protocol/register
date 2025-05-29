import { SwapDetails } from '@/components/ui/swap'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { mintValueUSDAtom } from './atom'

const Details = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const mintValueUSD = useAtomValue(mintValueUSDAtom)

  const ratioText = `1 ${indexDTF?.token?.symbol} = ${formatCurrency(indexDTFPrice || 0)} USDC`
  const mintFeeValue = mintValueUSD * (indexDTF?.mintingFee || 0)

  if (!indexDTF) return null

  return (
    <SwapDetails
      visible={{
        left: ratioText,
        right: (
          <span>
            <span className="text-muted-foreground">Fee</span>{' '}
            {formatPercentage(indexDTF.mintingFee * 100)}
          </span>
        ),
      }}
      details={[
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
        // {
        //   left: <span className="text-muted-foreground">Price Impact</span>,
        //   right: <ZapPriceImpact data={data} isDetail />,
        //   help: 'The impact your trade has on the market price.',
        // },
      ]}
    />
  )
}

export default Details
