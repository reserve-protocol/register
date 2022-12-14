import { InfoBox } from 'components'
import { Box, Card, Flex, Image } from 'theme-ui'

const Spacer = () => (
  <Flex sx={{ justifyContent: 'center' }} my={4}>
    <Box sx={{ width: '5px', height: '5px', backgroundColor: 'text' }} />
  </Flex>
)

const TransactionDivider = (props: { title: string; subtitle: string }) => (
  <Box>
    <Spacer />
    <Card>
      <Box variant="layout.verticalAlign">
        <Image src="/svgs/asterisk.svg" mr={3} />
        <InfoBox light {...props} />
      </Box>
    </Card>
    <Spacer />
  </Box>
)

export default TransactionDivider
