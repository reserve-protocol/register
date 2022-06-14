import { Trans } from '@lingui/macro'
import { Box, Text, Card, CardProps, Divider } from 'theme-ui'

interface Props extends CardProps {}

const PrimaryBasket = () => {
  return (
    <Card p={4}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>RToken Details</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
    </Card>
  )
}

export default PrimaryBasket
