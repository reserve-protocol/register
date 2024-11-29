import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { ArrowRight, Plus, Square, X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Text } from 'theme-ui'
import { ParameterChange } from '../hooks/useParametersChanges'
import { isAddress, shortenAddress } from 'utils'

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

interface ListChangePreviewProps extends BoxProps {
  isNew: boolean
  subtitle?: string
  value: string
  onRevert(): void
}

export const ListChangePreview = ({
  isNew,
  value,
  subtitle = '',
  onRevert,
  ...props
}: ListChangePreviewProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    {isNew ? (
      <Plus color="#11BB8D" size={18} />
    ) : (
      <X color="#FF0000" size={18} />
    )}
    <Box ml={2}>
      <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
        {isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>} {subtitle}
      </Text>
      <Text>{value}</Text>
    </Box>
    <SmallButton ml="auto" variant="muted" onClick={onRevert}>
      <Trans>Revert</Trans>
    </SmallButton>
  </Box>
)

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
          <Trans>Discard</Trans>
        </SmallButton>
      )}
    </Box>
    <Box
      variant="layout.verticalAlign"
      mt={2}
      sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
    >
      <Square fill="#FF0000" size={4} color="#FF0000" />
      <Box ml={2}>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          <Trans>Current</Trans>
        </Text>
        <Text>{isAddress(current) ? shortenAddress(current) : current}</Text>
      </Box>
      <ArrowRight
        style={{ marginLeft: 24, marginRight: 24 }}
        size={18}
        color="#808080"
      />
      <Box variant="layout.verticalAlign">
        <Square fill="#11BB8D" size={4} color="#11BB8D" />
        <Box ml={2}>
          <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
            <Trans>Proposed</Trans>
          </Text>
          <Text>
            {isAddress(proposed) ? shortenAddress(proposed) : proposed}
          </Text>
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
