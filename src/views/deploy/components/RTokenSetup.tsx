import { t } from '@lingui/macro'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import GovernanceSetup from 'components/rtoken-setup/governance/GovernanceSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { Box, BoxProps } from 'theme-ui'
import ListingInfo from 'views/management/components/ListingInfo'
import TokenParameters from './TokenParameters'
import TransactionDivider from './TransactionDivider'

const RTokenSetup = (props: BoxProps) => {
  return (
    <Box {...props}>
      <BasketSetup />
      <SectionWrapper navigationIndex={3}>
        <RevenueSplit mt={4} />
      </SectionWrapper>
      <TokenParameters mt={4} />
      <TransactionDivider
        title={t`Transaction 1`}
        subtitle={t`RToken gets deployed with your address as temporary owner`}
      />
      <SectionWrapper navigationIndex={5}>
        <GovernanceSetup />
      </SectionWrapper>
      <TransactionDivider
        title={t`Transaction 2`}
        subtitle={t`Governance gets deployed & your RToken is now usable (if unpaused)`}
      />
      <SectionWrapper navigationIndex={6} mb={4}>
        <ListingInfo />
      </SectionWrapper>
    </Box>
  )
}

export default RTokenSetup
