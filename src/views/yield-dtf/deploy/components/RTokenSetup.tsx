import { t } from '@lingui/macro'
import BasketSetup from 'components/rtoken-setup/basket/BasketSetup'
import GovernanceSetup from 'components/rtoken-setup/governance/GovernanceSetup'
import RevenueSplit from 'components/rtoken-setup/token/RevenueSplit'
import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { cn } from '@/lib/utils'
import BackingManager from './BackingManager'
import Intro from './Intro'
import OtherSetup from './OtherSetup'
import TokenParameters from './TokenParameters'
import TransactionDivider, { DeploySuccessDivider } from './TransactionDivider'

interface Props {
  governance?: boolean
  className?: string
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
      <SectionWrapper navigationIndex={1} className="my-4">
        <TokenParameters />
      </SectionWrapper>
      <BasketSetup startIndex={2} />
      <SectionWrapper navigationIndex={4} className="mt-4">
        <RevenueSplit />
      </SectionWrapper>
      <SectionWrapper navigationIndex={5} className="mt-4">
        <BackingManager />
      </SectionWrapper>
      <SectionWrapper navigationIndex={6} className="mt-4">
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
    <SectionWrapper className="relative" navigationIndex={7}>
      <GovernanceSetup disabled={!enabled} />
      {!enabled && (
        <div className="absolute top-0 bottom-0 w-full bg-background opacity-50" />
      )}
    </SectionWrapper>
    <TransactionDivider
      title={t`Transaction 2`}
      subtitle={t`Governance gets deployed & your RToken is now usable (if unpaused)`}
    />
  </>
)

const RTokenSetup = ({ governance = false, className }: Props) => {
  return (
    <div className={cn('mt-2 sm:mt-4 md:mt-6', className)}>
      <DeploySection enabled={!governance} />
      <GovernanceSection enabled={governance} />
    </div>
  )
}

export default RTokenSetup
