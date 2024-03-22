import { Trans } from '@lingui/macro'
import SpinnerIcon from 'components/icons/SpinnerIcon'
import { Box, BoxProps, Card, Text } from 'theme-ui'

const CancelAllButton = () => {}

const Header = () => (
  <Box
    variant="layout.verticalAlign"
    sx={{ borderBottom: '1px solid', borderColor: 'borderSecondary' }}
    pb={3}
  >
    <SpinnerIcon />
    <Text ml="2" variant="bold">
      <Trans>RSR available to withdraw</Trans>
    </Text>
  </Box>
)

const CooldownUnstake = (props: BoxProps) => {
  return (
    <Card
      p={4}
      sx={{
        backgroundColor: 'background',
        border: '3px solid',
        borderColor: 'border',
      }}
      {...props}
    >
      <Header />
      No unstake...
    </Card>
  )
}

export default CooldownUnstake
