import { t } from '@lingui/macro'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import GovernanceSetup from 'components/rtoken-setup/governance/GovernanceSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps } from 'theme-ui'
import BackingManager from './BackingManager'
import Intro from './Intro'
import OtherSetup from './OtherSetup'
import TokenParameters from './TokenParameters'
import TransactionDivider, { DeploySuccessDivider } from './TransactionDivider'

interface Props extends BoxProps {
  governance?: boolean
}

const DeploySection = ({ enabled = true }) => {
  const tx = null

  if (!enabled && tx) {
    return <DeploySuccessDivider hash={''} />
  }

  if (!enabled) {
    return null
  }

  return (
    <>
      <SectionWrapper navigationIndex={0}>
        <Intro />
      </SectionWrapper>
      <SectionWrapper navigationIndex={1} my={4}>
        <TokenParameters />
      </SectionWrapper>
      <BasketSetup startIndex={2} />
      <SectionWrapper navigationIndex={4} mt={4}>
        <RevenueSplit />
      </SectionWrapper>
      <SectionWrapper navigationIndex={5} mt={4}>
        <BackingManager />
      </SectionWrapper>
      <SectionWrapper navigationIndex={6} mt={4}>
        <OtherSetup />
      </SectionWrapper>
      <TransactionDivider
        title={t`Transaction 1`}
        subtitle={t`You submit the transaction configuring your RToken design`}
      />
    </>
  )
}

const GovernanceSection = ({ enabled = true }) => (
  <>
    <SectionWrapper sx={{ position: 'relative' }} navigationIndex={7}>
      <GovernanceSetup disabled={!enabled} />
      {!enabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'background',
            opacity: '50%',
          }}
        />
      )}
    </SectionWrapper>
    <TransactionDivider
      title={t`Transaction 2`}
      subtitle={t`Governance gets deployed & your RToken is now usable (if unpaused)`}
    />
  </>
)

const RTokenSetup = ({ governance = false, ...props }: Props) => {
  return (
    <Box mt={[2, 4, 6]} {...props}>
      <DeploySection enabled={!governance} />
      <GovernanceSection enabled={governance} />
    </Box>
  )
}

export default RTokenSetup
