import SectionContainer from '@/components/section-navigation/section-container'
import SectionWrapper from '@/components/section-navigation/section-wrapper'
import BackingInfo from './backing-info'
import BasicInfo from './basic-info'
import BasketInfo from './basket-info'
import ContractsInfo from './contracts-info'
import EmergencyCollateralInfo from './emergency-collateral-info'
import GovernanceInfo from './governance-info'
import OtherInfo from './other-info'
import RTokenManagement from './rtoken-management'
import RevenueSplitInfo from './revenue-split-info'

const RTokenOverview = () => (
  <SectionContainer>
    <SectionWrapper navigationIndex={0}>
      <RTokenManagement />
    </SectionWrapper>
    <SectionWrapper navigationIndex={1} className="mt-4">
      <BasicInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={2} className="mt-4">
      <BasketInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={3} className="mt-4">
      <EmergencyCollateralInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={4} className="mt-4">
      <RevenueSplitInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={5} className="mt-4">
      <BackingInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={6} className="mt-4">
      <OtherInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={7} className="mt-4">
      <GovernanceInfo />
    </SectionWrapper>
    <SectionWrapper navigationIndex={8} className="mt-4 mb-0 sm:mb-7">
      <ContractsInfo />
    </SectionWrapper>
  </SectionContainer>
)

export default RTokenOverview
