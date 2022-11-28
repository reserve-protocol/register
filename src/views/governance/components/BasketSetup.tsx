import CollateralModal from 'components/rtoken-setup/basket/CollateralModal'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import { useState } from 'react'
import { Box } from 'theme-ui'

const BasketSetup = () => {
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <Box>
      <PrimaryBasket onAdd={setCollateralModal} />
      {!!collateralModal && (
        <CollateralModal
          targetUnit={collateralModal?.targetUnit}
          basket={collateralModal?.basket}
          onClose={() => setCollateralModal(null)}
        />
      )}
    </Box>
  )
}

export default BasketSetup
