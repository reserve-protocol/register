import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Box, BoxProps, Text } from 'theme-ui'

interface Props extends BoxProps {
  isNew: boolean
  label: string
  onRevert?(): void
}

const ListItemPreview = ({ isNew, label, onRevert, ...props }: Props) => (
  <Box variant="layout.verticalAlign" {...props}>
    {isNew ? (
      <Plus color="#11BB8D" size={18} />
    ) : (
      <X color="#FF0000" size={18} />
    )}
    <Box ml={2}>
      <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
        {isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>}
      </Text>
      <Text>{label}</Text>
    </Box>
    {!!onRevert && (
      <Button size="sm" variant="ghost" onClick={onRevert} className="ml-auto">
        <Trans>Revert</Trans>
      </Button>
    )}
  </Box>
)

export default ListItemPreview
