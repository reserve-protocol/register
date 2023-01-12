import { t, Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { accountRoleAtom } from 'state/atoms'
import { Box, Divider as _Divider, Flex, Image, Text } from 'theme-ui'
import FreezeManager from './FreezeManager'
import PauseManager from './PauseManager'
import SettingItem from './SettingItem'

const Divider = () => (
  <_Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
)

// TODO: Fetch roles from theGraph - display correct address
// TODO: detect if it is alexios governance
const RTokenManagement = () => {
  const accountRole = useAtomValue(accountRoleAtom)

  const handleProposal = () => {}

  const handleEdit = () => {}

  return (
    <Box variant="layout.sticky" sx={{ height: '100%', overflowY: 'auto' }}>
      <Box variant="layout.borderBox" mb={4}>
        <PauseManager />
        <Divider />
        <FreezeManager />
        <Divider />
        <SettingItem
          title={t`Governance proposals`}
          subtitle={t`Role held by`}
          value={t`All stakers`}
          icon="hammer"
          action={t`Create proposal`}
          onAction={handleProposal}
        />
        {accountRole.owner && (
          <>
            <Divider />
            <SettingItem
              title="Make changes to RToken"
              subtitle={t`Available when no governance set up:`}
              action={t`Edit`}
              onAction={handleEdit}
            />
          </>
        )}
      </Box>
    </Box>
  )
}

export default RTokenManagement
