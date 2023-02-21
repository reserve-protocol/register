import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import OverviewIcon from 'components/icons/OverviewIcon'
import BackupBasket from 'components/rtoken-setup/basket/BackupBasket'
import CollateralModal from 'components/rtoken-setup/basket/CollateralModal'
import PrimaryBasket from 'components/rtoken-setup/basket/PrimaryBasket'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { isNewBackupProposedAtom, isNewBasketProposedAtom } from '../atoms'

const Overlay = ({ children, ...props }: BoxProps) => (
  <Box
    sx={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    }}
    {...props}
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
        top: 100,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  </Box>
)

const PrimaryBasketWarning = ({ onPropose }: { onPropose(): void }) => (
  <Box sx={{ maxWidth: 340, textAlign: 'center' }}>
    <OverviewIcon />
    <Text variant="title" mb={2}>
      <Trans>Change primary basket</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Pre-filled token weights on this page won’t accurately match the current
        basket distribution. Define how you would like to propose the basket
        should be distributed going forward.
      </Trans>
    </Text>
    <SmallButton mt={3} onClick={onPropose}>
      <Trans>Propose new basket</Trans>
    </SmallButton>
  </Box>
)

const BackupBasketWarning = ({ onPropose }: { onPropose(): void }) => (
  <Box sx={{ maxWidth: 340, textAlign: 'center' }}>
    <OverviewIcon />
    <Text variant="title" mb={2}>
      <Trans>Change backup basket</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Backup configuration tracks primary basket changes to update its values.
        This may not be desired on a proposal, you can choose to propose new
        changes.
      </Trans>
    </Text>
    <SmallButton mt={3} onClick={onPropose}>
      <Trans>Propose new backup configuration</Trans>
    </SmallButton>
  </Box>
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
        <Card p={4} sx={{ position: 'relative' }}>
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
        <Card mt={4} p={4} sx={{ position: 'relative' }}>
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
