import { t } from '@lingui/macro'
import { InfoBox } from 'components'
import { Box, Card, Flex, Image } from 'theme-ui'

const Spacer = () => (
  <Flex sx={{ justifyContent: 'center' }} my={4}>
    <Box sx={{ width: '5px', height: '5px', backgroundColor: 'text' }} />
  </Flex>
)

const TransactionDivider = () => (
  <Box>
    <Spacer />
    <Card>
      <Box variant="layout.verticalAlign">
        <Image src="/svgs/asterisk.svg" mr={3} />
        <InfoBox
          light
          title={t`Transaction 1`}
          subtitle={t`RToken gets deployed with your address as temporary owner`}
        />
      </Box>
    </Card>
    <Spacer />
  </Box>
)

export default TransactionDivider
