import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import OverviewIcon from 'components/icons/OverviewIcon'
import BackupBasket from 'components/rtoken-setup/basket/BackupBasket'
import CollateralModal from 'components/rtoken-setup/basket/CollateralModal'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { isNewBackupProposedAtom, isNewBasketProposedAtom } from '../atoms'
import { rTokenAtom, rTokenConfigurationAtom } from 'state/atoms'
import { cn } from '@/lib/utils'

interface OverlayProps {
  children: React.ReactNode
  className?: string
}

const Overlay = ({ children, className }: OverlayProps) => (
  <div className={cn('absolute inset-0', className)}>
    <div className="w-full h-full opacity-90 bg-card rounded-xl" />
    <div className="absolute top-[100px] left-0 right-0 flex items-center justify-center">
      {children}
    </div>
  </div>
)

const PrimaryBasketWarning = ({ onPropose }: { onPropose(): void }) => {
  const rToken = useAtomValue(rTokenAtom)
  const config = useAtomValue(rTokenConfigurationAtom)
  const warning =
    rToken?.supply && config?.minTrade
      ? config.minTrade * 100 > rToken.supply
      : false

  return (
    <div className="max-w-[340px] text-center">
      <OverviewIcon />
      <span
        className={cn(
          'text-xl font-medium mb-2 block',
          warning ? 'text-destructive' : 'text-foreground'
        )}
      >
        <Trans>Change primary basket</Trans>
      </span>
      <p className={warning ? 'font-semibold' : 'text-legend'}>
        {warning ? (
          <Trans>
            The token supply is not enough for changing the primary basket
            safely, contact the Reserve team for recommendations.
          </Trans>
        ) : (
          <Trans>
            Propose how the basket should be distributed going forward.{' '}
          </Trans>
        )}
      </p>
      <Button
        size="sm"
        className="mt-6"
        onClick={onPropose}
        variant={warning ? 'destructive' : 'default'}
      >
        <Trans>Propose new basket</Trans>
      </Button>
    </div>
  )
}

const BackupBasketWarning = ({ onPropose }: { onPropose(): void }) => (
  <div className="max-w-[340px] text-center">
    <OverviewIcon />
    <span className="text-xl font-medium mb-2 block">
      <Trans>Change backup basket</Trans>
    </span>
    <p className="text-legend">
      <Trans>
        Backup configuration tracks primary basket changes to update its values.
        This may not be desired on a proposal, you can choose to propose new
        changes.
      </Trans>
    </p>
    <Button size="sm" className="mt-6" onClick={onPropose}>
      <Trans>Propose new backup configuration</Trans>
    </Button>
  </div>
)

const ProposalBasketSetup = ({ startIndex }: { startIndex: number }) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )
  const [isNewBackupProposed, setProposeNewBackup] = useAtom(
    isNewBackupProposedAtom
  )
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <>
      <SectionWrapper navigationIndex={startIndex}>
        <Card className="p-6 relative">
          <PrimaryBasket onAdd={setCollateralModal} />
          {!isNewBasketProposed && (
            <Overlay>
              <PrimaryBasketWarning
                onPropose={() => setProposeNewBasket(true)}
              />
            </Overlay>
          )}
        </Card>
      </SectionWrapper>
      <SectionWrapper navigationIndex={startIndex + 1}>
        <Card className="mt-6 p-6 relative min-h-[360px]">
          <BackupBasket onAdd={setCollateralModal} />
          {!isNewBackupProposed && (
            <Overlay>
              <BackupBasketWarning
                onPropose={() => setProposeNewBackup(true)}
              />
            </Overlay>
          )}
        </Card>
      </SectionWrapper>

      {!!collateralModal && (
        <CollateralModal
          targetUnit={collateralModal?.targetUnit}
          basket={collateralModal?.basket}
          onClose={() => setCollateralModal(null)}
        />
      )}
    </>
  )
}

export default ProposalBasketSetup
