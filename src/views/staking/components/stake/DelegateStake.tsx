import { Trans } from '@lingui/macro'
import VoteIcon from 'components/icons/VoteIcon'
import { Edit2 } from 'react-feather'
import { Box, Divider, IconButton, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import EditDelegate from './EditDelegate'

const DelegateStake = ({
  editing,
  onEdit,
  value,
  onChange,
}: {
  value: string
  editing: boolean
  onEdit(value: boolean): void
  onChange(value: string): void
}) => (
  <>
    <Divider
      mx={-4}
      my={4}
      sx={{ borderStyle: 'dashed', borderColor: 'darkBorder' }}
    />
    {editing ? (
      <EditDelegate
        current={value}
        onSave={onChange}
        onDismiss={() => onEdit(false)}
      />
    ) : (
      <Box variant="layout.verticalAlign">
        <VoteIcon />
        <Text ml={3}>
          <Trans>Voting power delegation</Trans>:
        </Text>

        {value ? (
          <Box variant="layout.verticalAlign" ml="auto">
            <Text>{shortenAddress(value)}</Text>
            <IconButton sx={{ cursor: 'pointer' }} onClick={() => onEdit(true)}>
              <Edit2 size={14} />
            </IconButton>
          </Box>
        ) : (
          <Text ml="auto" variant="legend">
            <Trans>Connect your wallet</Trans>
          </Text>
        )}
      </Box>
    )}
  </>
)

export default DelegateStake
