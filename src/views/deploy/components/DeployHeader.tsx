import { Trans } from '@lingui/macro'
import { atom, useAtom } from 'jotai'
import { ChevronLeft } from 'react-feather'
import { Box, BoxProps, Button, Flex, IconButton, Text } from 'theme-ui'

export const deployStepAtom = atom(0)

interface Props extends BoxProps {
  isValid?: boolean
  title: string
  subtitle: string
  confirmText?: string
  gasCost?: number
  onConfirm?(): void
}

/**
 * View: Deploy -> Setup
 */
const DeployHeader = ({
  isValid = true,
  confirmText,
  title,
  subtitle,
  onConfirm,
  ...props
}: Props) => {
  const [current, setStep] = useAtom(deployStepAtom)

  const next = () => {
    setStep(current + 1)
  }

  const back = () => {
    setStep(current - 1)
  }

  return (
    <Flex variant="layout.verticalAlign" my={5} {...props}>
      {!!current && (
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
          <ChevronLeft size={14} />
        </IconButton>
      )}
      <Box>
        <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
          {title}
        </Text>
        <Text variant="legend">{subtitle}</Text>
      </Box>
      <Button
        onClick={onConfirm ? onConfirm : next}
        disabled={!isValid}
        px={4}
        ml="auto"
      >
        {confirmText ? confirmText : <Trans>Next</Trans>}
      </Button>
    </Flex>
  )
}

export default DeployHeader
