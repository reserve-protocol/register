import { useState } from 'react'
import { Box, Flex, Divider, Grid, Text } from 'theme-ui'
import BackupBasket from './BackupBasket'
import CollateralModal from './CollateralModal'
import PrimaryBasket from './PrimaryBasket'
import { truncateDecimals } from 'utils'
import { useAtomValue } from 'jotai'
import { Basket, basketAtom } from '../atoms'

/**
 * View: Deploy
 * BasketSetup view
 */

const getBasketComposition = (basket: Basket) => {
  return Object.keys(basket)
    .reduce((acc, unit) => {
      return `${acc} + ${truncateDecimals(+basket[unit].scale, 5)} ${unit}`
    }, '')
    .substring(2)
}

const BasketSetup = () => {
  const basket = useAtomValue(basketAtom)
  const units = Object.keys(basket)
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <>
      <Box sx={{ backgroundColor: 'contentBackground', borderRadius: 10 }}>
        <Flex sx={{ width: '100%', justifyContent: 'center' }} py={4} px={3}>
          <Box>
            <Text sx={{ width: 140 }}>1 [RToken] = </Text>
            <Text ml="auto" sx={{ fontWeight: 500 }}>
              {!!units.length ? getBasketComposition(basket) : '--'}
            </Text>
          </Box>
        </Flex>
        <Divider my={0} />
        <Grid columns={2} mb={4} gap={0}>
          <Box p={5} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
            <PrimaryBasket onAdd={setCollateralModal} />
          </Box>
          <BackupBasket p={5} onAdd={setCollateralModal} />
        </Grid>
        {!!collateralModal && (
          <CollateralModal
            targetUnit={collateralModal?.targetUnit}
            basket={collateralModal?.basket}
            onClose={() => setCollateralModal(null)}
          />
        )}
      </Box>
    </>
  )
}

export default BasketSetup
