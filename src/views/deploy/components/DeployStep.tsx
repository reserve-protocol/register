import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { Check } from 'react-feather'
import { Box, Flex, Text } from 'theme-ui'

// Actual screens
export enum Steps {
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

function getTextColor(step: number, currentStep: number) {
  if (step > currentStep) {
    return 'lightText'
  } else if (step < currentStep) {
    return 'success'
  }

  return 'text'
}

/**
 * Tracks RToken deployment step (Top header)
 */
const DeploymentStepTracker = ({ step }: { step: number }) => {
  const isSecondPhase = step > Steps.DeployToken

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
    if (isSecondPhase) {
      list = list.slice(3)
      list[0].label = t`RToken Deployed`
    }

    return list
  }, [isSecondPhase])

  return (
    <Flex
      variant="layout.verticalAlign"
      py={3}
      px={4}
      sx={{
        justifyContent: !isSecondPhase ? 'center' : 'inherit',
        borderBottom: '1px solid',
        borderColor: 'darkBorder',
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
