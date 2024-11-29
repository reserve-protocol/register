import { Trans } from '@lingui/macro'
import Help from 'components/help'
import { AlertCircle } from 'lucide-react'
import { Box, BoxProps, Text, Card } from 'theme-ui'

const Caution = (props: BoxProps) => (
  <Box sx={{ fontSize: 1 }}>
    <Card
      py={1}
      px={2}
      sx={{
        display: ['none', 'flex'],
        alignItems: 'center',
        background: 'rgba(255, 138, 0, 0.1)',
        borderRadius: '8px',
        color: 'warning',
      }}
    >
      <Help
        color="var(--theme-ui-colors-warning)"
        content="Both Register & the Reserve Protocol are brand new. There are risks with using any new smart contract technology."
      />
      <Text ml={2} mr={1} sx={{ fontWeight: 500 }}>
        <Trans>Caution</Trans>
      </Text>
    </Card>
  </Box>
)

export default Caution
