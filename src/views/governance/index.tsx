import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom } from 'state/atoms'
import { deployStepAtom } from '../deploy/components/DeployHeader'
import { Steps } from '../deploy/components/DeployStep'
import ConfirmGovernanceSetup from './views/ConfirmGovernanceSetup'
import GovernanceSetup from './views/GovernanceSetup'
import GovernanceStatus from './views/GovernanceStatus'

const defaultValues = {
  defaultGovernance: true,
  unfreeze: '0',
  votingDelay: '5', // 5 blocks
  votingPeriod: '18000', // 100 blocks
  proposalThresholdAsMicroPercent: '1', // 1%
  quorumPercent: '4', // 4%
  minDelay: '24', // 24 hours -> 86400
  freezer: '',
  pauser: '',
  owner: '',
}

const Views = {
  [Steps.GovernanceSetup.toString()]: GovernanceSetup,
  [Steps.GovernanceSummary.toString()]: ConfirmGovernanceSetup,
  [Steps.GovernanceTx.toString()]: GovernanceStatus,
}

// TODO: Refactor into multiple components
const Governance = () => {
  const [currentStep, setCurrentStep] = useAtom(deployStepAtom)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const accountRole = useAtomValue(accountRoleAtom)
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(Steps.GovernanceSetup)

    return () => {
      setCurrentStep(Steps.Intro)
    }
  }, [])

  useEffect(() => {
    if (!accountRole.owner) {
      navigate('/')
    }
  }, [accountRole])

  const GovernanceView = Views[currentStep.toString()] || GovernanceSetup

  return (
    <FormProvider {...form}>
      <GovernanceView />
    </FormProvider>
  )
}

export default Governance
