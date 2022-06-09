import { Trans } from '@lingui/macro'
import { Button } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { Text, BoxProps, Flex, Card } from 'theme-ui'

interface Props extends BoxProps {
  onSetup(): void
}

const BasketOverview = ({ onSetup, ...props }: Props) => {
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
      <Button onClick={onSetup} px={4}>
        <Trans>Set basket</Trans>
      </Button>
    </Card>
  )
}

export default BasketOverview
