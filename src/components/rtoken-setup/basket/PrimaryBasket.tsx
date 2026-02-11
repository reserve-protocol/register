import { t, Trans } from '@lingui/macro'
import NewCollateralAbi from 'abis/NewCollateralAbi'
import Help from 'components/help'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { chainIdAtom, collateralYieldAtom } from 'state/atoms'
import { Separator } from '@/components/ui/separator'
import {
  formatCurrency,
  formatPercentage,
  getPrice,
  truncateDecimals,
} from 'utils'
import { formatEther } from 'viem'
import { Basket, basketAtom, basketTargetUnitPriceAtom } from '../atoms'
import UnitBasket from './UnitBasket'
import { Button } from '@/components/ui/button'
import DocsLink from '@/components/utils/docs-link'
import { useWatchReadContracts } from '@/hooks/useWatchReadContract'
import { PROTOCOL_DOCS } from '@/utils/constants'

interface PrimaryBasketProps {
  onAdd?(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
  readOnly?: boolean
  className?: string
}

const getBasketComposition = (
  basket: Basket,
  targetUnitPrice: Record<string, number>
) => {
  return Object.keys(basket)
    .reduce((acc, unit) => {
      return `${acc} + ${truncateDecimals(
        +basket[unit].scale,
        18
      )} ${unit} ($${formatCurrency(
        +basket[unit].scale * (targetUnitPrice[unit] || 0)
      )})`
    }, '')
    .substring(2)
}

const Placeholder = () => (
  <div className="flex items-center text-center flex-col max-w-[440px] mx-auto mt-5 py-6">
    <EmptyBoxIcon />
    <span className="font-semibold block my-2">
      <Trans>Empty Basket</Trans>
    </span>
    <p className="text-legend text-xs mb-2">
      <Trans>
        This is the target collateral basket at the onset of an RToken that
        defines which collateral needs to be deposited for issuances. The prime
        basket is directly set by governance, and only changes through
        successful governance proposals.
      </Trans>
    </p>
  </div>
)

const usePricePerTarget = (basket: Basket) => {
  const chainId = useAtomValue(chainIdAtom)
  const [units, calls] = useMemo(() => {
    const units = Object.keys(basket)
    const calls = units.reduce((acc, unit) => {
      const call = {
        abi: NewCollateralAbi,
        address: basket[unit].collaterals[0].address,
        chainId,
      }

      return [
        ...acc,
        {
          ...call,
          functionName: 'price',
        },
        { ...call, functionName: 'refPerTok' },
        { ...call, functionName: 'targetPerRef' },
      ]
    }, [] as any)

    return [units, calls]
  }, [JSON.stringify(basket), chainId])

  const result = useWatchReadContracts({
    contracts: calls,
    allowFailure: false,
    query: {
      select: (data) => {
        return units.reduce(
          (acc, unit, index) => {
            if (unit === 'USD') {
              acc[unit] = 1
              return acc
            }

            const price = getPrice(data[index * 3] as [bigint, bigint])
            const refPerTok = Number(formatEther(data[index * 3 + 1] as bigint))
            const targetPerRef = Number(
              formatEther(data[index * 3 + 2] as bigint)
            )
            acc[unit] = price / refPerTok / targetPerRef

            return acc
          },
          {} as Record<string, number>
        )
      },
    },
  })

  return result
}

const TargetPriceUpdater = () => {
  const basket = useAtomValue(basketAtom)
  const result = usePricePerTarget(basket)
  const setTargetPrices = useSetAtom(basketTargetUnitPriceAtom)

  useEffect(() => {
    if (result.data) setTargetPrices(result.data)
  }, [result])

  return null
}

const BasketEstimatedApy = () => {
  const basket = useAtomValue(basketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const collateralYields = useAtomValue(collateralYieldAtom)
  const targetUnitPrice = useAtomValue(basketTargetUnitPriceAtom)
  const units = Object.keys(basket)

  const getEstApy = useCallback(() => {
    return Object.keys(basket).reduce((prev, current, index) => {
      const currentBasket = basket[current]
      const scale = Number(currentBasket.scale)
      let targetUnitApy = 0

      for (let i = 0; i < currentBasket.collaterals.length; i++) {
        targetUnitApy +=
          (collateralYields[chainId]?.[
            currentBasket.collaterals[i].symbol.toLowerCase()
          ] || 0) * (+currentBasket.distribution[i] / 100 || 0)
      }

      return prev + targetUnitApy * scale
    }, 0)
  }, [collateralYields, basket, chainId])

  return (
    <div className="flex justify-between items-center">
      <div className="mr-auto flex flex-col">
        <span className="text-legend">1 Token =</span>
        <span className="text-xl font-medium">
          {!!units.length
            ? getBasketComposition(basket, targetUnitPrice)
            : '--'}
        </span>
        <span className="text-legend mt-2">
          <Trans>Estimated basket APY</Trans> =
        </span>
        <span className="text-xl font-medium">{formatPercentage(getEstApy())}</span>
      </div>
      <Help
        ml={2}
        size={14}
        mt="1px"
        content={t`Total initial RToken scale including all targets. If your RToken only has one target unit this will be the same as the basket scale input.`}
      />
    </div>
  )
}

// TODO: Create read only component and remove readOnly flag
/**
 * View: Deploy -> Basket setup
 * Display primary basket (per target unit) and token composition
 */
const PrimaryBasket = ({
  onAdd = () => { },
  readOnly = false,
  className,
}: PrimaryBasketProps) => {
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)

  return (
    <div className={className}>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          <Trans>Primary Basket</Trans>
        </span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/deployment_guide/ui_walkthrough/#step-3-configure-basket`}
        />
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => onAdd({ basket: 'primary' })}
            className="ml-auto"
          >
            <Trans>Add to basket</Trans>
          </Button>
        )}
      </div>
      {!units.length && <Placeholder />}
      {units.map((targetUnit) => (
        <UnitBasket
          className="mt-3"
          readOnly={readOnly}
          key={targetUnit}
          data={basket[targetUnit]}
          unit={targetUnit}
        />
      ))}
      {!readOnly && (
        <>
          <Separator className="my-4 -mx-4 border-muted" />
          <BasketEstimatedApy />
        </>
      )}
      <TargetPriceUpdater />
    </div>
  )
}

export default PrimaryBasket
