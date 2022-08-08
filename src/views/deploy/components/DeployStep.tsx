import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, Flex } from 'theme-ui'

// Fork steps, no "complete" status
const untrackedSteps = [3, 6]

// TODO:
const DeploymentStepTracker = ({ step }: { step: number }) => {
  const Steps = useMemo(
    () => [
      <Trans>RToken params</Trans>,
      <Trans>Baskets</Trans>,
      <Trans>Deploy Tx</Trans>,
      <Box>Fork</Box>,
      <Trans>Governance setup</Trans>,
      <Trans>Governance Transaction</Trans>,
      <Box>Custom</Box>,
      <Trans>Done</Trans>,
    ],
    []
  )

  return <Flex variant="layout.verticalAlign"></Flex>
}

export default DeploymentStepTracker
