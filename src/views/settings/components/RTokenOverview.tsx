import SectionContainer from 'components/section-navigation/SectionContainer'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import BackingInfo from './BackingInfo'
import BasicInfo from './BasicInfo'
import BasketInfo from './BasketInfo'
import ContractsInfo from './ContractsInfo'
import EmergencyCollateralInfo from './EmergencyCollateralInfo'
import GovernanceInfo from './GovernanceInfo'
import OtherInfo from './OtherInfo'
import RTokenManagement from './RTokenManagement'
import RevenueSplitInfo from './RevenueSplitInfo'

const RTokenOverview = () => (
  <SectionContainer>
    <SectionWrapper navigationIndex={0}>
      <RTokenManagement />
    </SectionWrapper>
    <SectionWrapper navigationIndex={1} mt={4}>
      <BasicInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={2} mt={4}>
      <BasketInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={3} mt={4}>
      <EmergencyCollateralInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={4} mt={4}>
      <RevenueSplitInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={5} mt={4}>
      <BackingInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={6} mt={4}>
      <OtherInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={7} mt={4}>
      <GovernanceInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={8} mt={4} mb={[0, 7]}>
      <ContractsInfo />
    </SectionWrapper>
  </SectionContainer>
)

export default RTokenOverview
