import { Trans } from '@lingui/macro'
import DocsLink from '@/components/utils/docs-link'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { backupCollateralAtom, basketAtom } from '../atoms'
import EmergencyCollateral from './EmergencyCollateral'
import { PROTOCOL_DOCS } from '@/utils/constants'

interface BackupBasketProps {
  onAdd?(
    data: {
      basket: 'primary' | 'backup'
      targetUnit?: string
    } | null
  ): void
  readOnly?: boolean
  className?: string
}

const Placeholder = () => (
  <div>
    <div className="opacity-40">
      <div className="flex items-center mt-4">
        <span>
          <Trans>Diversity factor</Trans>
        </span>
        <span className="ml-auto">N=</span>
        <div className="rounded-2xl mr-2 px-3">
          <span className="text-[#333]">0</span>
        </div>
      </div>
      <div className="text-center py-8 px-4">
        <EmptyBoxIcon />
        <span className="font-medium block my-2">
          <Trans>Empty backup basket</Trans>
        </span>
        <span className="text-legend text-xs">
          <Trans>
            Each target unit of your primary basket will have defined emergency
            collateral to replace with in case of default.
          </Trans>
        </span>
      </div>
    </div>
  </div>
)

// TODO: Create readonly component and remove flag
/**
 * View: Deploy -> BasketSetup
 * Show emergency collateral per target unit
 */
const BackupBasket = ({
  onAdd = () => {},
  readOnly = false,
  className,
}: BackupBasketProps) => {
  const targetUnits = Object.keys(useAtomValue(basketAtom))
  const backupBasket = useAtomValue(backupCollateralAtom)

  const handleAdd = useCallback(
    (targetUnit: string) => {
      onAdd({ basket: 'backup', targetUnit })
    },
    [onAdd]
  )

  if (readOnly && !targetUnits.length) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <span className="text-xl font-medium">Emergency Collateral</span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/deployment_guide/ui_walkthrough/#step-4-configure-backup-basket`}
        />
      </div>
      {targetUnits.map((targetUnit) =>
        readOnly && !backupBasket[targetUnit]?.collaterals.length ? (
          <div className="my-3 px-1" key={targetUnit}>
            <span>
              <Trans>No emergency collateral for target</Trans> {targetUnit}
            </span>
          </div>
        ) : (
          <div key={targetUnit}>
            <EmergencyCollateral
              readOnly={readOnly}
              onAdd={handleAdd}
              key={targetUnit}
              targetUnit={targetUnit}
              {...backupBasket[targetUnit]}
            />
          </div>
        )
      )}
      {!targetUnits.length && <Placeholder />}
    </div>
  )
}

export default BackupBasket
