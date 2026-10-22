import { useWatch } from 'react-hook-form'
import { Trans } from '@lingui/react/macro'
import NextButton from '../../components/next-button'
import { ToggleGroupPreset } from '../../components/toggle-group-preset'
import { NewVaultForm, OptimisticGovernanceForm } from './optimistic-form'
import StandardGovernanceForm from './standard-form'

const Section = ({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) => (
  <>
    <h3 className="px-6 pt-2 pb-2 text-base font-bold">{title}</h3>
    {children}
  </>
)

const GovernanceSettings = () => {
  const erc20 = useWatch({ name: 'governanceERC20address' })

  return (
    <>
      <div className="px-6 pb-6 text-base">
        <Trans>
          One governor controls this DTF: basket changes and every other
          setting. Standard proposals go to a vote. Optimistic proposals from
          trusted proposers pass unless holders veto them.
        </Trans>
      </div>
      <Section title={<Trans>Standard proposals</Trans>}>
        <ToggleGroupPreset section="governance" />
        <StandardGovernanceForm />
      </Section>
      <Section title={<Trans>Optimistic proposals</Trans>}>
        <OptimisticGovernanceForm />
      </Section>
      {!!erc20 && (
        <Section title={<Trans>New vote-lock vault</Trans>}>
          <NewVaultForm />
        </Section>
      )}
      <NextButton />
    </>
  )
}

export default GovernanceSettings
