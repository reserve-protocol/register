import { t, Trans } from '@lingui/macro'
import GoTo from '@/components/go-to'
import DiversityFactorIcon from '@/components/icons/DiversityFactorIcon'
import TokenItem from '@/components/token-item'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenBackupAtom, rTokenBasketAtom } from '@/state/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { InfoCard } from './settings-info-card'

const EmergencyCollateralInfo = () => {
  const units = Object.keys(useAtomValue(rTokenBasketAtom))
  const backupBasket = useAtomValue(rTokenBackupAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <InfoCard title={t`Emergency Collateral`}>
      <div className="p-4">
        {units.map((unit, unitIndex) => (
          <div key={unit} className={unitIndex ? 'mt-4' : ''}>
            {unitIndex > 0 && <hr className="my-4 border-border" />}
            <span className="font-semibold mb-3 block">
              {unit} <Trans>Backups</Trans>
            </span>
            {backupBasket && backupBasket[unit]?.collaterals.length ? (
              <>
                <div className="flex">
                  <div className="flex items-center mb-1">
                    <DiversityFactorIcon />
                    <span className="ml-2">
                      <Trans>Diversity Factor</Trans>
                    </span>
                  </div>
                  <span className="ml-auto">
                    {backupBasket[unit].diversityFactor}
                  </span>
                </div>
                {backupBasket[unit].collaterals.map((collateral, index) => (
                  <div
                    className="flex items-center mt-3"
                    key={collateral.address}
                  >
                    <TokenItem width={16} symbol={collateral.symbol} />
                    <span className="ml-auto">{index + 1}</span>
                    <GoTo
                      className="ml-2"
                      href={getExplorerLink(
                        collateral.address,
                        chainId,
                        ExplorerDataType.ADDRESS
                      )}
                    />
                  </div>
                ))}
              </>
            ) : (
              <span className="text-legend">
                <Trans>No emergency collateral for this target unit</Trans>
              </span>
            )}
          </div>
        ))}
      </div>
    </InfoCard>
  )
}

export default EmergencyCollateralInfo
