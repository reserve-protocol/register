import { t, Trans } from '@lingui/macro'
import GoTo from '@/components/go-to'
import TokenItem from '@/components/token-item'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenBasketAtom } from '@/state/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { InfoCard } from './settings-info-card'

const BasketInfo = () => {
  const basket = useAtomValue(rTokenBasketAtom)
  const units = Object.keys(basket)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <InfoCard title={t`Primary Basket`}>
      <div className="p-4">
        {units.map((unit, unitIndex) => (
          <div key={unit} className={unitIndex ? 'mt-4' : ''}>
            {unitIndex > 0 && <hr className="my-4 border-border" />}
            <span className="font-semibold block mb-3">
              {unit} <Trans>Basket</Trans>
            </span>
            {basket[unit].collaterals.map((collateral, index) => (
              <div
                className={`flex items-center ${index ? 'mt-3' : ''}`}
                key={collateral.address}
              >
                <TokenItem width={16} symbol={collateral.symbol} />
                <span className="ml-auto">
                  {+basket[unit].distribution[index]}%
                </span>
                <GoTo
                  className="ml-3 flex-shrink-0"
                  href={getExplorerLink(
                    collateral.address,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </InfoCard>
  )
}

export default BasketInfo
