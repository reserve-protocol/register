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
      <Card p={4}>
        <SectionWrapper navigationIndex={startIndex}>
          <PrimaryBasket onAdd={setCollateralModal} />
        </SectionWrapper>
      </Card>
      <Card mt={4} p={4}>
        <SectionWrapper navigationIndex={startIndex + 1}>
          <BackupBasket onAdd={setCollateralModal} />
        </SectionWrapper>
      </Card>
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
