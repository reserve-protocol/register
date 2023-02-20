import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import OverviewIcon from 'components/icons/OverviewIcon'
import BackupBasket from 'components/rtoken-setup/basket/BackupBasket'
import CollateralModal from 'components/rtoken-setup/basket/CollateralModal'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { Box, Card, Text } from 'theme-ui'
import { isNewBasketProposedAtom } from '../atoms'

const Overlay = ({ onPropose }: { onPropose(): void }) => (
  <Box
    sx={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    }}
  >
    <Card
      sx={{
        width: '100%',
        height: '100%',
        opacity: '90%',
        backgroundColor: 'contentBackground',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ maxWidth: 360, textAlign: 'center' }}>
        <OverviewIcon />
        <Text variant="title" mb={2}>
          <Trans>Change primary basket</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Pre-filled token weights won’t accurately match the current
            distribution. Changing the basket means defining how you want the
            distribution going forward.
          </Trans>
        </Text>
        <SmallButton mt={3} onClick={onPropose}>
          <Trans>Propose new basket</Trans>
        </SmallButton>
      </Box>
    </Box>
  </Box>
)

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
        <Card p={4} sx={{ position: 'relative' }}>
          <PrimaryBasket onAdd={setCollateralModal} />
          {!isNewBasketProposed && (
            <Overlay onPropose={() => setProposeNewBasket(true)} />
          )}
        </Card>
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
