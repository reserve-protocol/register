import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Check } from 'react-feather'
import { Box, Flex, Text } from 'theme-ui'

// Actual screens
enum Steps {
  Intro,
  Baskets,
  Parameters,
  Summary,
  DeployToken,
  TokenManagement,
  GovernanceSetup,
  GovernanceSummary,
  GovernanceTx,
  DeploymentFinished,
}

interface Props {
  step: number
  gasCost: number // Only required for deployment step
}

function getTextColor(step: number, currentStep: number) {
  if (step > currentStep) {
    return 'lightText'
  } else if (step < currentStep) {
    return 'success'
  }

  return 'text'
}

// TODO: Re-use part of this component for governance deploy track
const DeploymentStepTracker = ({ step }: { step: number }) => {
  const stepList = useMemo(() => {
    let list = [
      { id: Steps.Intro, label: t`Intro` },
      { id: Steps.Baskets, label: t`Baskets` },
      { id: Steps.Parameters, label: t`Parameters` },
      { id: Steps.DeployToken, label: t`Deploy Tx` },
      { id: Steps.GovernanceSetup, label: t`Governance Setup` },
      { id: Steps.GovernanceTx, label: t`Governance Tx` },
      { id: Steps.DeploymentFinished, label: t`Done` },
    ]

    // Second step has a different shorter header
    if (step > Steps.DeployToken) {
      list = list.slice(3)
      list[0].label = t`RToken Deployed`
    }

    return list
  }, [step])

  return (
    <Flex
      variant="layout.verticalAlign"
      p={3}
      sx={{
        justifyContent: 'center',
        borderBottom: '1px solid',
        borderColor: 'border',
      }}
    >
      {stepList.map((item) => (
        <Box
          key={item.id}
          mr={3}
          sx={{ color: getTextColor(item.id, step) }}
          variant="layout.verticalAlign"
        >
          {item.id < step && <Check size={18} style={{ marginRight: 5 }} />}
          <Text>{item.label}</Text>
        </Box>
      ))}
    </Flex>
  )
}

export default DeploymentStepTracker
