import { Trans } from '@lingui/macro'
import { atom, useAtom, useAtomValue } from 'jotai'
import { ChevronLeft } from 'react-feather'
import { Box, BoxProps, Button, Flex, IconButton, Text } from 'theme-ui'
import { isValidBasketAtom } from '../atoms'

export const deployStepAtom = atom(0)

/**
 * View: Deploy -> Setup
 */
const DeployHeader = (props: BoxProps) => {
  const [isValidBasket] = useAtomValue(isValidBasketAtom)
  const [current, setStep] = useAtom(deployStepAtom)
  const canSubmit = true

  const next = () => {
    setStep(current + 1)
  }

  const back = () => {
    setStep(current - 1)
  }

  return (
    <Flex variant="layout.verticalAlign" {...props}>
      <IconButton
        mr={3}
        onClick={back}
        sx={{
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 10,
        }}
      >
        <ChevronLeft />
      </IconButton>
      <Box>
        <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
          <Trans>Define Baskets</Trans>
        </Text>
        <Text variant="legend">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </Box>
      <Button onClick={next} disabled={!canSubmit} px={4} ml="auto">
        <Trans>Next</Trans>
      </Button>
    </Flex>
  )
}

export default DeployHeader
