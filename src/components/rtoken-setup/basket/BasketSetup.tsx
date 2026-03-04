import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import BackupBasket from './BackupBasket'
import CollateralModal from './CollateralModal'
import PrimaryBasket from './PrimaryBasket'

const BasketSetup = ({ startIndex = 2 }) => {
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <>
      <SectionWrapper navigationIndex={startIndex}>
        <Card className="p-4 bg-secondary">
          <PrimaryBasket onAdd={setCollateralModal} />
        </Card>
      </SectionWrapper>
      <SectionWrapper navigationIndex={startIndex + 1}>
        <Card className="mt-4 p-4 bg-secondary">
          <BackupBasket onAdd={setCollateralModal} />
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

export default BasketSetup
