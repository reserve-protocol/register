import { t } from '@lingui/macro'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import GovernanceSetup from 'components/rtoken-setup/governance/GovernanceSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps } from 'theme-ui'
import ListingInfo from 'views/management/components/ListingInfo'
import { useDeployTxState } from '../useDeploy'
import TokenParameters from './TokenParameters'
import TransactionDivider, { DeploySuccessDivider } from './TransactionDivider'

interface Props extends BoxProps {
  governance?: boolean
}

const DeploySection = ({ enabled = true }) => {
  const tx = useDeployTxState()

  if (!enabled && tx) {
    return <DeploySuccessDivider hash={tx.hash} />
  }

  return (
    <>
      <BasketSetup />
      <SectionWrapper navigationIndex={3}>
        <RevenueSplit mt={4} />
      </SectionWrapper>
      <TokenParameters mt={4} />
      <TransactionDivider
        title={t`Transaction 1`}
        subtitle={t`RToken gets deployed with your address as temporary owner`}
      />
    </>
  )
}

const GovernanceSection = ({ enabled = true }) => (
  <>
    <SectionWrapper sx={{ position: 'relative' }} navigationIndex={5}>
      {!enabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'inputBorder',
            opacity: 0.3,
            zIndex: 9999,
          }}
        />
      )}
      <GovernanceSetup disabled={!enabled} />
    </SectionWrapper>
    <TransactionDivider
      title={t`Transaction 2`}
      subtitle={t`Governance gets deployed & your RToken is now usable (if unpaused)`}
    />
    <SectionWrapper navigationIndex={6} mb={4}>
      <ListingInfo />
    </SectionWrapper>
  </>
)

const RTokenSetup = ({ governance = false, ...props }: Props) => {
  return (
    <Box {...props}>
      <DeploySection enabled={!governance} />
      <GovernanceSection enabled={governance} />
    </Box>
  )
}

export default RTokenSetup
