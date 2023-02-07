import { SmallButton } from 'components/button'
import BackupBasket from 'components/rtoken-setup/basket/BackupBasket'
import CollateralModal from 'components/rtoken-setup/basket/CollateralModal'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { Box, Card } from 'theme-ui'
import BasketInfo from 'views/settings/components/BasketInfo'
import { isNewBasketProposedAtom } from '../atoms'

const ProposalBasketSetup = () => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )
  const [collateralModal, setCollateralModal] = useState<{
    basket: 'primary' | 'backup'
    targetUnit?: string
  } | null>(null)

  return (
    <>
      <SectionWrapper navigationIndex={0}>
        {isNewBasketProposed ? (
          <Card p={4}>
            <PrimaryBasket onAdd={setCollateralModal} />
          </Card>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <BasketInfo />
            <SmallButton
              sx={{ position: 'absolute', top: '28px', right: 4 }}
              onClick={() => setProposeNewBasket(true)}
            >
              Propose new basket
            </SmallButton>
          </Box>
        )}
      </SectionWrapper>
      <SectionWrapper navigationIndex={1}>
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

export default ProposalBasketSetup
