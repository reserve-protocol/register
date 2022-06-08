import { Trans } from '@lingui/macro'
import { Button } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { Text, BoxProps, Flex, Card } from 'theme-ui'

const BasketOverview = (props: BoxProps) => {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 286,
      }}
      {...props}
    >
      <RTokenLight />
      <Text mt={3} mb={3} sx={{ fontSize: 3 }}>
        <Trans>Set your collateral basket</Trans>
      </Text>
      <Button px={4}>
        <Trans>Set basket</Trans>
      </Button>
    </Card>
  )
}

export default BasketOverview
