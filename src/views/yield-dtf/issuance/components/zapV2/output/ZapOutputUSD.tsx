import Skeleton from 'react-loading-skeleton'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'
import Help from 'components/help'

const ZapOutputUSD = () => {
  const { tokenOut, amountOut, zapDustUSD, loadingZap } = useZap()

  if (loadingZap) {
    return <Skeleton height={18} width={240} />
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-legend overflow-hidden text-ellipsis">
        ${formatCurrency((tokenOut?.price || 0) * Number(amountOut), 2)}
      </span>
      {zapDustUSD !== undefined && zapDustUSD !== 0 && (
        <>
          <span>
            {' '}
            +{' '}
            <span className="text-legend font-semibold">
              ${formatCurrency(+zapDustUSD, 2)}
            </span>{' '}
            in dust
          </span>
          <Help
            mt="2px"
            content={`Dust is the leftover amount of tokens that cannot be exchanged or included in the RToken mint, due to the zapper route. It will be sent back to your wallet.`}
          />
        </>
      )}
    </div>
  )
}

export default ZapOutputUSD
