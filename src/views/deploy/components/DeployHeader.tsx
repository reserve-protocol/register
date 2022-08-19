import { Trans } from '@lingui/macro'
import { atom, useAtom } from 'jotai'
import { ChevronLeft } from 'react-feather'
import {
  Box,
  BoxProps,
  Button,
  Flex,
  IconButton,
  Spinner,
  Text,
} from 'theme-ui'
import { formatCurrency } from 'utils'

export const deployStepAtom = atom(0)

interface Props extends BoxProps {
  isValid?: boolean
  title: string
  subtitle: string
  confirmText?: string
  gasCost?: number
  onConfirm?(): void
  onBack?(): void
}

// TODO: Refactor in favor of a more re-usable component
/**
 * View: Deploy -> Setup
 */
const DeployHeader = ({
  isValid = true,
  confirmText,
  title,
  gasCost,
  subtitle,
  onBack,
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

  const showBack = (current !== 0 && current !== 6) || onBack

  return (
    <Flex variant="layout.verticalAlign" my={5} {...props} pr={5}>
      {showBack && (
        <IconButton
          mr={3}
          onClick={onBack ? onBack : back}
          sx={{
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'darkBorder',
            borderRadius: 10,
          }}
        >
          <ChevronLeft size={14} />
        </IconButton>
      )}
      <Box ml={showBack ? 0 : 5}>
        <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
          {title}
        </Text>
        <Text variant="legend">{subtitle}</Text>
      </Box>
      <Box mx="auto" />
      {gasCost !== undefined && (
        <Box mr={4} variant="layout.verticalAlign">
          <Text variant="legend" mr={2}>
            <Trans>Estimated gas cost:</Trans>
          </Text>
          {gasCost ? (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(gasCost)}</Text>
          ) : (
            <Spinner color="black" size={12} />
          )}
        </Box>
      )}
      <Button onClick={onConfirm ? onConfirm : next} disabled={!isValid} px={4}>
        {confirmText ? confirmText : <Trans>Next</Trans>}
      </Button>
    </Flex>
  )
}

export default DeployHeader
