import { rTokenContractsAtom } from '@/state/atoms'
import { VERSION } from '@/utils/constants'
import BackingManager from '@/views/yield-dtf/deploy/components/BackingManager'
import OtherSetup from '@/views/yield-dtf/deploy/components/OtherSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box } from 'theme-ui'
import ContractUpgrades from './ContractUpgrades'
import ProposalGovernanceParams from './forms/ProposalGovernanceParams'
import Intro from './Intro'
import ProposalBasketSetup from './ProposalBasketSetup'
import RegisterProposal from './RegisterProposal'
import RolesProposal from './RolesProposal'
import SpellUpgrade3_4_0 from './SpellUpgrade3_4_0'
import SpellUpgrade4_2_0 from './SpellUpgrade4_2_0'
import TraderImplementationProposal from './TraderImplementationProposal'
import UnregisterProposal from './UnregisterProposal'

const ProposalForm = () => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const version = contracts?.main?.version ?? VERSION

  const sections = useMemo(
    () => [
      Intro,
      BackingManager,
      OtherSetup,
      TraderImplementationProposal,
      RolesProposal,
      RevenueSplit,
      UnregisterProposal,
      RegisterProposal,
      ContractUpgrades,
      ...(version < '3.4.0' ? [SpellUpgrade3_4_0] : []),
      ...(version < '4.2.0' ? [SpellUpgrade4_2_0] : []),
      ProposalGovernanceParams,
    ],
    [version]
  )

  return (
    <Box mb={4}>
      {sections.map((Component, index) => (
        <SectionWrapper
          key={index}
          threshold={index === 3 ? 0.3 : 0.5}
          navigationIndex={index}
          mb={4}
        >
          <Component />
        </SectionWrapper>
      ))}
      <ProposalBasketSetup startIndex={sections.length} />
    </Box>
  )
}

export default ProposalForm
