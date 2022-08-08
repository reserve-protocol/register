import { useState } from 'react'
import { Box, Divider, Grid } from 'theme-ui'
import BackupBasket from './BackupBasket'
import CollateralModal from './CollateralModal'
import PrimaryBasket from './PrimaryBasket'

/**
 * View: Deploy
 * BasketSetup view
 */
const BasketSetup = () => {
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <>
      <Grid
        columns={2}
        mb={4}
        sx={{ backgroundColor: 'contentBackground', borderRadius: 10 }}
      >
        <Box sx={{ borderRight: '1px solid', borderColor: 'border' }}>
          <PrimaryBasket onAdd={setCollateralModal} />
        </Box>
        <BackupBasket onAdd={setCollateralModal} />
      </Grid>
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
