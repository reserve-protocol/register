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
    <Modal title={t`Collateral Plugins`} style={{ width: 480 }} {...props}>
      <Flex variant="verticalAlign" mt={3}>
        <Box mr={4}>
          <Text>
            <Trans>What is this list?</Trans>
          </Text>
          <Text variant="legend" mt={1} sx={{ fontSize: 1, display: 'block' }}>
            <Trans>
              These collateral plugins either exist in othe rRTokens or have
              been defined already by the Reserve team.
            </Trans>
          </Text>
        </Box>
        <Box mt={1}>
          <Help content="TODO" />
        </Box>
      </Flex>
      <Divider mx={-4} my={3} />
      <Button sx={{ width: '100%' }}>
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
