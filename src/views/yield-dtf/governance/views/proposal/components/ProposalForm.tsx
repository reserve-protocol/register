import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { rTokenContractsAtom } from '@/state/atoms'
import { VERSION } from '@/utils/constants'
import BackingManager from '@/views/yield-dtf/deploy/components/BackingManager'
import OtherSetup from '@/views/yield-dtf/deploy/components/OtherSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
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

const ALLOWED_RTOKENS = ['0xcb327b99ff831bf8223cced12b1338ff3aa322ff']

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
      ...(version < '4.2.0' && ALLOWED_RTOKENS.includes(contracts?.token?.address.toLowerCase() ?? '') ? [SpellUpgrade4_2_0] : []),
      ProposalGovernanceParams,
    ],
    [version]
  )

  return (
    <div className="mb-4">
      {sections.map((Component, index) => (
        <SectionWrapper
          key={index}
          threshold={index === 3 ? 0.3 : 0.5}
          navigationIndex={index}
          className="mb-4"
        >
          <Component />
        </SectionWrapper>
      ))}
      <ProposalBasketSetup startIndex={sections.length} />
    </div>
  )
}

export default ProposalForm
