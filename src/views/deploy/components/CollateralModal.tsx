import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import Help from 'components/help'
import { ModalProps } from 'components/modal'
import { Box, Divider, Flex, Text } from 'theme-ui'

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

const CollateralModal = ({
  targetUnit,
  basket = 'primary',
  ...props
}: Props) => {
  return (
    <Modal title={t`Collateral Plugins`} {...props}>
      <Box>
        <Flex variant="verticalAlign">
          What is this list?
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          These collateral plugins either exist in othe rRTokens or have been
          defined already by the Reserve team.
        </Text>
      </Box>
      <Divider mx={-4} my={3} />
      <Button>
        <Text>
          {basket === 'primary' ? (
            <Trans>Add to primary basket</Trans>
          ) : (
            <Trans>Add to backup basket</Trans>
          )}
        </Text>
      </Button>
    </Modal>
  )
}

export default CollateralModal
