import { Trans } from '@lingui/macro'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { BigNumberMap, Token } from 'types'
import { getAddress } from 'viem'
import CollateralValue from './CollateralValue'

interface Props {
  collaterals: Token[]
  quantities: BigNumberMap | null
  prices?: (number | undefined)[]
  className?: string
}

const CollateralDistribution = ({
  collaterals,
  quantities,
  prices,
  className,
}: Props) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <div
      className={cn('border border-input rounded-md px-2 py-4', className)}
    >
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setVisible(!isVisible)}
      >
        <OverviewIcon />
        <span className="ml-2">
          <Trans>Collateral distribution</Trans>
        </span>
        <div className="mx-auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isVisible && (
        <div>
          <Separator className="-mx-2 my-2" />
          {collaterals.map((collateral, i) => (
            <div
              key={collateral.address}
              className="flex items-center mt-2 justify-between"
            >
              <div>
                <TokenItem symbol={collateral.symbol} />
              </div>
              {quantities && quantities[getAddress(collateral.address)] ? (
                <CollateralValue
                  quantity={quantities[getAddress(collateral.address)]}
                  decimals={collateral.decimals}
                  price={prices?.[i]}
                />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CollateralDistribution
