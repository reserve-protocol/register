import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useState } from 'react'
import { Card } from 'theme-ui'
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
        <Card p={4}>
          <PrimaryBasket onAdd={setCollateralModal} />
        </Card>
      </SectionWrapper>
      <SectionWrapper navigationIndex={startIndex + 1}>
        <Card mt={4} p={4}>
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
