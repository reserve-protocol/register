import { t, Trans } from '@lingui/macro'
import { NumericalInput } from 'components'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatCurrency, truncateDecimals } from 'utils'
import {
  basketTargetUnitPriceAtom,
  PrimaryUnitBasket,
  updateBasketUnitAtom,
} from '../atoms'
import { collateralDisplay } from 'utils/constants'
import Skeleton from 'react-loading-skeleton'
import { X } from 'lucide-react'

const IconInfo = ({
  icon,
  title,
  text,
  help,
}: {
  icon: React.ReactNode
  title: string
  text: string
  help?: string
}) => (
  <div className="flex items-center">
    {icon}
    <div className="ml-2">
      <div className="flex items-center">
        <span className="text-sm text-legend">{title}</span>
        {!!help && <Help ml={2} content={help} />}
      </div>
      <span>{text}</span>
    </div>
  </div>
)

interface UnitBasketProps {
  data: PrimaryUnitBasket
  unit: string
  readOnly?: boolean
  className?: string
}

/**
 * View: Deploy -> Basket setup -> PrimaryBasket
 * Display collateral composition for target unit
 */
const UnitBasket = ({ data, readOnly, unit, className }: UnitBasketProps) => {
  const updateBasket = useSetAtom(updateBasketUnitAtom)
  const targetUnitPrice = useAtomValue(basketTargetUnitPriceAtom)[unit]

  const totalDistribution = useMemo(
    () => data.distribution.reduce((count, n) => count + Number(n), 0),
    [data.distribution]
  )
  const getCollateralDist = (index: number) => {
    return truncateDecimals((+data.scale * +data.distribution[index]) / 100, 5)
  }

  const handleRemove = (index: number) => {
    const n = data.collaterals.length - 1
    const distribution = new Array(n).fill(100 / n)

    updateBasket([
      unit,
      {
        ...data,
        distribution,
        collaterals: [
          ...data.collaterals.slice(0, index),
          ...data.collaterals.slice(index + 1),
        ],
      },
    ])
  }

  const handleDistribution = (index: number, value: string) => {
    updateBasket([
      unit,
      {
        ...data,
        distribution: [
          ...data.distribution.slice(0, index),
          value,
          ...data.distribution.slice(index + 1),
        ],
      },
    ])
  }

  const handleScale = (scale: string) => {
    updateBasket([unit, { ...data, scale: scale }])
  }

  return (
    <div className={className}>
      <Separator className="my-4 -mx-4 border-muted" />
      {!readOnly && (
        <>
          <div className="flex justify-between flex-wrap gap-2 mb-3 mt-4">
            <span className="text-xl font-medium">
              {unit} <Trans>Basket</Trans>
            </span>
            <div className="flex items-center">
              <div className="w-16 mr-3">
                <NumericalInput
                  value={data.scale}
                  className={`text-center text-sm p-1 border rounded ${+data.scale > 0 ? 'border-border' : 'border-destructive'}`}
                  onChange={handleScale}
                />
              </div>
              <div>
                <span className="mr-2">{unit}</span>
                {targetUnitPrice ? (
                  <span className="text-legend block text-xs">
                    1 = {formatCurrency(targetUnitPrice)}$
                  </span>
                ) : (
                  <Skeleton />
                )}
              </div>
              <Help
                content={t`Basket scale for this unit of account. This is used to initially calculate how much of each token is required for minting.`}
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm">
              <Trans>{unit} Token distribution</Trans>
            </span>
            <span
              className={`ml-auto text-xs ${totalDistribution !== 100 ? 'text-destructive' : ''}`}
            >
              Filled: {totalDistribution}%
            </span>
          </div>
        </>
      )}
      {data.collaterals.map((collateral, index) => (
        <div key={collateral.address} className="flex items-center mt-3">
          <IconInfo
            icon={<TokenLogo width={18} symbol={collateral.symbol} />}
            title={unit}
            help={`Collateral Address: ${collateral.address}`}
            text={
              readOnly
                ? collateralDisplay[collateral.symbol.toLowerCase()] ||
                  collateral.symbol
                : `${getCollateralDist(index)} in ${
                    collateralDisplay[collateral.symbol.toLowerCase()] ||
                    collateral.symbol
                  }`
            }
          />
          {!readOnly ? (
            <div className="ml-auto w-20 mr-2">
              <NumericalInput
                className={`text-center text-sm p-1.5 border rounded ${
                  +data.distribution[index] > 0 && +data.distribution[index] <= 100
                    ? 'border-border'
                    : 'border-destructive'
                }`}
                value={data.distribution[index]}
                disabled={data.collaterals.length > 1 ? false : true}
                onChange={(value) => handleDistribution(index, value)}
              />
            </div>
          ) : (
            <span className="ml-auto">
              {Math.round(+data.distribution[index] * 100) / 100}
            </span>
          )}

          <span>%</span>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 cursor-pointer"
              onClick={() => handleRemove(index)}
            >
              <X size={20} className="text-muted-foreground" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default UnitBasket
