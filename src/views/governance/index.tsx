import { t, Trans } from '@lingui/macro'
import { Container, InfoBox } from 'components'
import { Field, FormField } from 'components/field'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom } from 'state/atoms'
import { Box, Card, Flex, Grid, Select, Switch, Text } from 'theme-ui'
import { addressPattern, numberPattern } from 'utils'
import { ROUTES } from 'utils/constants'
import DeployHeader, { deployStepAtom } from '../deploy/components/DeployHeader'
import DeploymentStepTracker, { Steps } from '../deploy/components/DeployStep'
import GovernanceForm from './components/GovernanceForm'
import GovernanceSetup from './views/GovernanceSetup'

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
  [Steps.GovernanceSummary.toString()]: GovernanceSetup,
  [Steps.GovernanceTx.toString()]: GovernanceSetup,
}

// TODO: Refactor into multiple components
const Governance = () => {
  const [currentStep, setCurrentStep] = useAtom(deployStepAtom)
  const [currentView, setCurrentView] = useState(Steps.GovernanceSetup)
  const [defaultGovernance, setDefaultGovernance] = useState(true)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const accountRole = useAtomValue(accountRoleAtom)
  const navigate = useNavigate()
  const [unfreeze, setUnfreeze] = useState(0)

  useEffect(() => {
    setCurrentView(Steps.GovernanceSetup)

    return setCurrentView(Steps.Intro)
  }, [])

  useEffect(() => {
    if (!accountRole.owner) {
      navigate('/')
    }
  }, [accountRole])

  const handleBack = () => {
    navigate(ROUTES.MANAGEMENT)
  }

  const handleConfirm = () => {}

  const handleCustomGovernance = (e: any) => {
    setDefaultGovernance(e.target.checked)
  }

  const handleFreezeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnfreeze(+e.currentTarget.value)
  }

  const GovernanceView = Views[currentStep.toString()] || GovernanceSetup

  return (
    <FormProvider {...form}>
      <GovernanceView />
    </FormProvider>
  )
}

export default Governance
