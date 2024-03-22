import { Trans } from '@lingui/macro'
import { Box, BoxProps, Text } from 'theme-ui'
import AvailableUnstake from './AvailableUnstake'
import CooldownUnstake from './CooldownUnstake'
import Updater from './Updater'

const Withdraw = (props: BoxProps) => {
  return (
    <>
      <Box {...props}>
        <Text ml="4" variant="bold" sx={{ fontSize: 4 }}>
          <Trans>In Withdraw Process</Trans>
        </Text>
        <AvailableUnstake mt={4} />
        <CooldownUnstake mt={4} />
      </Box>
      <Updater />
    </>
  )
}

export default Withdraw
