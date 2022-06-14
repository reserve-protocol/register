import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { ModalProps } from 'components/modal'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import {
  Box,
  BoxProps,
  Checkbox,
  Divider,
  Flex,
  IconButton,
  Text,
} from 'theme-ui'
import { shortenAddress } from 'utils'
import collateralPlugins, { CollateralPlugin } from '../plugins'

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

interface PluginItemProps extends BoxProps {
  data: CollateralPlugin
}

const PluginItem = ({ data, ...props }: PluginItemProps) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Box {...props}>
      <Flex variant="layout.verticalAlign">
        <TokenLogo />
        <Box ml={2}>
          <Text>{data.symbol} plug-in</Text>
          <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
            <Trans>Target</Trans> {data.targetUnit} | {data.description}
          </Text>
        </Box>
        <Box mx="auto" />
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mr={3}>
          {shortenAddress(data.address)}
        </Text>
        <Checkbox />
        <IconButton
          sx={{ cursor: 'pointer' }}
          ml={-1}
          onClick={() => setVisible(!isVisible)}
        >
          {isVisible ? (
            <ChevronUp color="#999999" />
          ) : (
            <ChevronDown color="#999999" />
          )}
        </IconButton>
      </Flex>
      {isVisible && (
        <>
          <Divider mt={2} />
          <Flex variant="layout.verticalAlign" mt={3} sx={{ fontSize: 1 }}>
            <Box mr={4}>
              <Text variant="legend">
                <Trans>Reference unit</Trans>
              </Text>
              <Text sx={{ textDecoration: 'underline', display: 'block' }}>
                {data.referenceUnit}
              </Text>
            </Box>
            <Box mr={4}>
              <Text variant="legend">
                <Trans>Collateral token</Trans>
              </Text>
              <Text sx={{ textDecoration: 'underline', display: 'block' }}>
                {data.collateralToken}
              </Text>
            </Box>
            <Box>
              <Text variant="legend">
                <Trans>Oracle</Trans>
              </Text>
              <Text sx={{ textDecoration: 'underline', display: 'block' }}>
                {data.oracle}
              </Text>
            </Box>
          </Flex>
        </>
      )}
    </Box>
  )
}

const CollateralModal = ({
  targetUnit,
  basket = 'primary',
  ...props
}: Props) => {
  const [selected, setSelected] = useState<string[]>([])
  const plugins = useMemo(
    () =>
      targetUnit
        ? collateralPlugins.filter((plugin) => plugin.targetUnit === targetUnit)
        : collateralPlugins,
    [targetUnit]
  )

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
      <Box
        sx={{
          maxHeight: 'calc(100vh - 500px)',
          overflow: 'auto',
        }}
        mx={-4}
      >
        {plugins.map((plugin) => (
          <>
            <PluginItem px={4} data={plugin} key={plugin.symbol} mb={3} />
            <Divider my={3} />
          </>
        ))}
        <Flex variant="layout.verticalAlign" mx={4}>
          <Box>
            <Text>
              <Trans>Made your own collateral?</Trans>
            </Text>
            <Text
              variant="legend"
              mt={1}
              sx={{ fontSize: 1, display: 'block' }}
            >
              <Trans>Use a custom address</Trans>
            </Text>
          </Box>
          <Box mx="auto" />
          <SmallButton mr={3}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help content="TODO" />
        </Flex>
      </Box>
      <Divider mx={-4} my={3} />
      <Button mt={1} disabled={!selected.length} sx={{ width: '100%' }}>
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
