import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { ArrowRight, Square } from 'react-feather'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Text } from 'theme-ui'
import { ParameterChange } from '../hooks/useParametersChanges'

interface ParameterPreviewProps extends BoxProps {
  values: ParameterChange
}

interface ParameterChangePreview extends BoxProps {
  title: string
  subtitle: string
  current: string
  proposed: string
  onRevert?(): void
}

export const ParameterChangePreview = ({
  title,
  subtitle,
  current,
  proposed,
  onRevert,
  ...props
}: ParameterChangePreview) => (
  <Box {...props}>
    <Box variant="layout.verticalAlign">
      <Box>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          {title}
        </Text>
        <Text>{subtitle}</Text>
      </Box>
      {!!onRevert && (
        <SmallButton ml="auto" onClick={onRevert} variant="muted">
          <Trans>Revert</Trans>
        </SmallButton>
      )}
    </Box>
    <Box
      variant="layout.verticalAlign"
      mt={2}
      sx={{ justifyContent: 'center' }}
    >
      <Square fill="#FF0000" size={4} color="#FF0000" />
      <Box ml={2} mr={4}>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          <Trans>Current</Trans>
        </Text>
        <Text>{current}</Text>
      </Box>
      <ArrowRight size={18} color="#808080" />
      <Box ml={4} variant="layout.verticalAlign">
        <Square fill="#11BB8D" size={4} color="#11BB8D" />
        <Box ml={2}>
          <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
            <Trans>Proposed</Trans>
          </Text>
          <Text>{proposed}</Text>
        </Box>
      </Box>
    </Box>
  </Box>
)

export const ParameterPreview = ({
  values,
  ...props
}: ParameterPreviewProps) => {
  const { resetField } = useFormContext()
  const { field, current, proposed } = values

  const handleRevert = () => {
    resetField(field)
  }
  return (
    <ParameterChangePreview
      title={t`Change`}
      subtitle={field}
      current={current}
      proposed={proposed}
      onRevert={handleRevert}
      {...props}
    />
  )
}
