import { t } from '@lingui/macro'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import GovernanceSetup from 'components/rtoken-setup/governance/GovernanceSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps } from 'theme-ui'
import ListingInfo from 'views/settings/components/ListingInfo'
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

  if (!enabled) {
    return null
  }

  return (
    <>
      <BasketSetup />
      <SectionWrapper navigationIndex={3}>
        <RevenueSplit mt={5} />
      </SectionWrapper>
      <TokenParameters mt={5} />
      <TransactionDivider
        title={t`Transaction 1`}
        subtitle={t`You submit the transaction configuring your RToken design`}
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
            backgroundColor: 'background',
            opacity: '50%',
            zIndex: 9999,
          }}
        />
      )}
      <GovernanceSetup disabled={!enabled} />

      <TransactionDivider
        title={t`Transaction 2`}
        subtitle={t`You submit the transaction configuration your RToken governance`}
      />
      <SectionWrapper navigationIndex={6} mb={4}>
        <ListingInfo />
      </SectionWrapper>
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
