import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, Flex } from 'theme-ui'

// Fork steps, no "complete" status
const untrackedSteps = [3, 6]

// TODO:
const DeploymentStepTracker = ({ step }: { step: number }) => {
  const Steps = useMemo(
    () => [
      <Trans>Baskets</Trans>,
      <Trans>RToken params</Trans>,
      <Trans>Deploy Tx</Trans>,
      <Box>Fork</Box>,
      <Trans>Governance setup</Trans>,
      <Trans>Governance Transaction</Trans>,
      <Box>Custom</Box>,
      <Trans>Done</Trans>,
    ],
    []
  )

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
      {Steps.map((step: any) => (
        <Box mr={3}>{step}</Box>
      ))}
    </Flex>
  )
}

export default DeploymentStepTracker
